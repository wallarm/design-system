import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';

import { CLAUDE_DESIGN } from '../config';
import { themeSelector } from '../tokens/build-tokens';
import { canvasSafelist } from './safelist';
import { CANVAS_WRAPPER_CLASS, tolerateCanvasWrappers } from './wrapper-css';

export interface BuildCssOptions {
  outDir: string;
  tokenNames: Set<string>;
}

/** Strip token mirrors only where tokens.css defines the same unconditional scope. */
export function stripTokenDeclarations(css: string, tokenNames: Set<string>): string {
  const root = postcss.parse(css);
  root.walkDecls(declaration => {
    if (!tokenNames.has(declaration.prop)) return;
    const parent = declaration.parent;
    if (
      parent?.type !== 'rule' ||
      !parent.selectors.every(selector => themeSelector(selector) !== undefined)
    )
      return;
    let ancestor = parent.parent;
    while (ancestor && ancestor.type !== 'root') {
      if (ancestor.type !== 'atrule' || ancestor.name !== 'layer') return;
      ancestor = ancestor.parent;
    }
    declaration.remove();
  });
  root.walkRules(rule => {
    if (rule.nodes.length === 0) rule.remove();
  });
  return root.toString();
}

/** Class names `css` defines, unescaped; arbitrary-value and `(--var)` classes are component internals. */
export function definedClasses(css: string): string[] {
  const classes = new Set<string>();
  postcss.parse(css).walkRules(rule => {
    for (const [, name = ''] of rule.selector.matchAll(/\.((?:\\.|[\w-])+)/g))
      classes.add(name.replace(/\\(.)/g, '$1'));
  });
  classes.delete(CANVAS_WRAPPER_CLASS);
  return [...classes]
    .filter(name => !/[[(]/.test(name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

/** components/UTILITIES.md: every authorable class bundle.css defines, by variant and utility. */
export function utilitiesReference(css: string): string {
  const groups = new Map<string, Map<string, string[]>>();
  for (const name of definedClasses(css)) {
    const split = name.lastIndexOf(':') + 1;
    const variant = name.slice(0, split);
    const utility = name.slice(split);
    const root = /^-?[a-z0-9]+/.exec(utility)?.[0] ?? utility;
    const byRoot = groups.get(variant) ?? new Map<string, string[]>();
    byRoot.set(root, [...(byRoot.get(root) ?? []), name]);
    groups.set(variant, byRoot);
  }
  const lines = [
    '# Utility classes that exist',
    '',
    'Generated from `components/bundle.css`. This is the complete list of utility classes you can write in canvas markup. **No other class exists**: the CSS is compiled ahead of time, there is no JIT, and arbitrary values such as `p-[13px]` or `w-[420px]` have no rule unless a component already uses that exact class. A missing class renders as nothing, silently.',
    '',
    '- Every numeric utility means N px (spacing *and* sizing): `p-16` is 16px, `w-256` is 256px, `size-24` is 24px. Tailwind habits are 4× off: write `p-16`, not `p-4`.',
    '- Stay on the spacing scale; reach for `Stack` / `Flex` `gap` props and `Page*` / `Card*` components before raw layout classes.',
    '- `sm:` / `md:` / `lg:` / `xl:` follow the viewport width, not the artboard width.',
    '- For a value that is not here, use an inline style with a token: `style="gap: var(--spacing-16)"`.',
    '',
  ];
  for (const [variant, byRoot] of [...groups].sort(([a], [b]) => a.localeCompare(b, 'en'))) {
    lines.push(`## ${variant ? `\`${variant}\` variants` : 'Base utilities'}`, '');
    for (const [root, names] of [...byRoot].sort(([a], [b]) => a.localeCompare(b, 'en')))
      lines.push(`- **${root}**: ${names.map(name => `\`${name}\``).join(' ')}`);
    lines.push('');
  }
  return lines.join('\n');
}

export async function buildCss({
  outDir,
  tokenNames,
}: BuildCssOptions): Promise<{ bytes: number; wrapperSkipped: string[] }> {
  const entry = fileURLToPath(new URL('./entry.css', import.meta.url));
  const source = `${await readFile(entry, 'utf8')}\n@source inline(${JSON.stringify(canvasSafelist(tokenNames).join(' '))});\n`;
  const result = await postcss([
    tailwindcss({ base: path.dirname(entry), optimize: false, transformAssetUrls: false }),
  ]).process(source, { from: entry, map: false });
  // All theme font faces are generated from the same source by tokens.css, whose
  // relative fonts/ URLs point at the uploaded font assets.
  result.root.walkAtRules('font-face', rule => {
    rule.remove();
  });
  const compiled = postcss.parse(stripTokenDeclarations(result.root.toString(), tokenNames));
  compiled.walkRules(rule => {
    if (!rule.selectors.every(selector => [':root', ':host', ':where(:root)'].includes(selector)))
      return;
    if (!rule.nodes.some(node => node.type === 'decl' && node.prop.startsWith('--'))) return;
    let ancestor = rule.parent;
    while (ancestor && ancestor.type !== 'root') {
      if (ancestor.type !== 'atrule' || ancestor.name !== 'layer') return;
      ancestor = ancestor.parent;
    }
    // Unsupported ambient variables still need a light boundary when a light
    // artboard is nested in a dark page. Keep their expressions live in CSS.
    rule.selectors = [...rule.selectors, '[data-theme="light"]'];
  });
  const wrapped = tolerateCanvasWrappers(compiled.toString());
  const css = wrapped.css;
  const bytes = Buffer.byteLength(css);
  if (bytes > CLAUDE_DESIGN.cssCapBytes)
    throw new Error(`bundle.css exceeds ${CLAUDE_DESIGN.cssCapBytes} bytes (${bytes})`);
  if (/<\/style/i.test(css))
    throw new Error('bundle.css contains an unsafe inline style terminator');
  await mkdir(path.join(outDir, 'components'), { recursive: true });
  await writeFile(path.join(outDir, 'components/bundle.css'), css);
  await writeFile(path.join(outDir, 'components/UTILITIES.md'), utilitiesReference(css));
  return { bytes, wrapperSkipped: wrapped.skipped };
}
