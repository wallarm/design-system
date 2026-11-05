import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { CLAUDE_DESIGN, PACKAGE_DIR } from '../config';

/** Shipped at the project root, so its link lines match the README's load order. */
export const SAMPLER_FILE = 'sampler.dc.html';
/** The app frame a new canvas starts from; customized only through its APP object. */
export const SKELETON_FILE = 'app-skeleton.dc.html';
/** The line that opens the skeleton's one editable data object; README and SETUP name it. */
export const SKELETON_DATA = 'var APP = {';

const LINKS = [
  '<link rel="stylesheet" href="tokens.css">',
  '<link rel="stylesheet" href="components/bundle.css">',
  '<script src="components/bundle.js"></script>',
];
const CLASS_ATTRIBUTE = /\sclass(?:-name)?="([^"]*)"|\bclassName:\s*'([^']*)'/g;
const SPACING_CLASS =
  /^-?(?:p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left)-(\d+)$/;

/** Whether `css` has a rule for `.name`, escaped the way Tailwind writes it. */
const definesClass = (css: string, name: string) => {
  const selector = `.${name.replace(/[^\w-]/g, '\\$&')}`;
  for (let at = css.indexOf(selector); at !== -1; at = css.indexOf(selector, at + 1))
    if (!/[\w\\-]/.test(css[at + selector.length] ?? '')) return true;
  return false;
};

/** Why an artboard (the sampler, the skeleton) would not render as written: unlinked system, missing classes or globals, off-scale spacing. */
export function samplerProblems(
  html: string,
  { css, tokens, exports }: { css: string; tokens: string; exports: readonly string[] },
): string[] {
  const problems: string[] = [];
  const at = LINKS.map(line => html.indexOf(line));
  if (at.some((index, i) => index === -1 || (i > 0 && index < (at[i - 1] ?? 0))))
    problems.push(`head must link, in order: ${LINKS.join(' ')}`);
  const scale = new Set([...tokens.matchAll(/--spacing-(\d+):/g)].map(([, n]) => n));
  const classes = new Set(
    [...html.matchAll(CLASS_ATTRIBUTE)].flatMap(([, attr, js]) =>
      (attr ?? js ?? '').split(/\s+/).filter(Boolean),
    ),
  );
  for (const name of classes) {
    if (!definesClass(css, name)) problems.push(`class ${name} has no rule in bundle.css`);
    const step = SPACING_CLASS.exec(name.split(':').at(-1) ?? '')?.[1];
    if (step && !scale.has(step)) problems.push(`class ${name} is off the spacing scale`);
  }
  for (const [, step] of html.matchAll(/var\(--spacing-([\w-]+)\)/g))
    if (!scale.has(step ?? '')) problems.push(`var(--spacing-${step}) is not a token`);
  const globals = new Set(exports);
  // `DS` is the scripts' `var DS = WallarmDS` alias.
  for (const [, name] of html.matchAll(
    new RegExp(`\\b(?:${CLAUDE_DESIGN.namespace}|DS)\\.(\\w+)`, 'g'),
  ))
    if (!globals.has(name ?? ''))
      problems.push(`${CLAUDE_DESIGN.namespace}.${name} is not exported`);
  return [...new Set(problems)];
}

/** Checks the sampler and the skeleton against the built CSS, tokens and bundle exports, then ships them. */
export async function buildSampler({ outDir }: { outDir: string }) {
  const meta = JSON.parse(
    await readFile(resolve(PACKAGE_DIR, '.claude-design/meta.json'), 'utf8'),
  ) as { exports: string[] };
  const context = {
    css: await readFile(join(outDir, 'components/bundle.css'), 'utf8'),
    tokens: await readFile(join(outDir, 'tokens.css'), 'utf8'),
    exports: meta.exports,
  };
  for (const file of [SAMPLER_FILE, SKELETON_FILE]) {
    const html = await readFile(new URL(`./${file}`, import.meta.url), 'utf8');
    const problems = samplerProblems(html, context);
    if (file === SKELETON_FILE && html.split(SKELETON_DATA).length !== 2)
      problems.push(`must open its data object with "${SKELETON_DATA}" exactly once`);
    if (problems.length) throw new Error(`${file}:\n- ${problems.join('\n- ')}`);
    await writeFile(join(outDir, file), html);
  }
}
