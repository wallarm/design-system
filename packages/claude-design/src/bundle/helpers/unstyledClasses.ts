// Canvas markup can name any class, but bundle.css is precompiled: a class
// it does not define renders as nothing. Root reports each such class once in
// the console, which Claude reads, so it can correct an off-scale class without a human.

/** Classes that mark an element for other selectors and never have a rule of their own. */
const MARKERS = /^(?:group|peer)(?:\/|$)|^(?:sc-host-x|dark|light)$/;
const CLASS_IN_SELECTOR = /\.((?:\\[0-9a-fA-F]{1,6} ?|\\.|[\w-])+)/g;
const ESCAPE = /\\([0-9a-fA-F]{1,6}) ?|\\(.)/g;

const unescapeCss = (name: string): string =>
  name.replace(ESCAPE, (_, hex: string | undefined, char: string | undefined) =>
    hex ? String.fromCodePoint(Number.parseInt(hex, 16)) : (char ?? ''),
  );

/** Every class named by a style rule the document can read, or undefined when a sheet is unreadable. */
export function styledClasses(document: Document): Set<string> | undefined {
  const classes = new Set<string>();
  const walk = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      const selector = (rule as CSSStyleRule).selectorText;
      if (selector)
        for (const [, name = ''] of selector.matchAll(CLASS_IN_SELECTOR))
          classes.add(unescapeCss(name));
      const nested = (rule as CSSGroupingRule).cssRules;
      if (nested) walk(nested);
    }
  };
  try {
    for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules);
  } catch {
    // A cross-origin sheet hides its rules; without them every answer could be wrong.
    return undefined;
  }
  return classes;
}

/** The warning for `name`, with Tailwind's 4px reading when the 1px scale has it. */
export function unstyledMessage(name: string, styled: ReadonlySet<string>): string {
  const numeric = /^(.*?-)(\d+)$/.exec(name);
  const tailwind = numeric ? `${numeric[1]}${Number(numeric[2]) * 4}` : undefined;
  const hint =
    tailwind && styled.has(tailwind)
      ? ` Numeric utilities mean N px here: Tailwind's ${name} is ${tailwind}.`
      : ' Numeric utilities mean N px here; stay on the spacing scale.';
  return `[WallarmDS] class "${name}" has no CSS.${hint} The classes that exist are listed in components/UTILITIES.md.`;
}

interface PageState {
  reported: Set<string>;
  sheets: number;
  styled: Set<string> | undefined;
}
const pages = new WeakMap<Document, PageState>();

/** Warns once per page for each class under `root` that no readable style rule names. Never throws. */
export function reportUnstyledClasses(root: Element): void {
  try {
    const document = root.ownerDocument;
    const sheets = document.styleSheets.length;
    const page = pages.get(document) ?? { reported: new Set(), sheets: -1, styled: undefined };
    pages.set(document, page);
    // Rebuilt only when a stylesheet is added or removed.
    if (page.sheets !== sheets) Object.assign(page, { sheets, styled: styledClasses(document) });
    const { reported, styled } = page;
    if (!styled || styled.size === 0) return;
    for (const element of [root, ...Array.from(root.querySelectorAll('[class]'))])
      for (const name of Array.from(element.classList)) {
        if (reported.has(name) || styled.has(name) || MARKERS.test(name)) continue;
        reported.add(name);
        // oxlint-disable-next-line no-console -- the console is how the canvas author sees it.
        console.warn(unstyledMessage(name, styled));
      }
  } catch {
    // Diagnostics only: a canvas must never break because of them.
  }
}
