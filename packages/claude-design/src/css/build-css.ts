import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLAUDE_DESIGN } from '../config';
import { themeSelector } from '../tokens/build-tokens';
import { canvasSafelist } from './safelist';

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

export async function buildCss({
  outDir,
  tokenNames,
}: BuildCssOptions): Promise<{ bytes: number }> {
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
  const css = compiled.toString();
  const bytes = Buffer.byteLength(css);
  if (bytes > CLAUDE_DESIGN.cssCapBytes)
    throw new Error(`bundle.css exceeds ${CLAUDE_DESIGN.cssCapBytes} bytes (${bytes})`);
  if (/<\/style/i.test(css))
    throw new Error('bundle.css contains an unsafe inline style terminator');
  await mkdir(path.join(outDir, 'components'), { recursive: true });
  await writeFile(path.join(outDir, 'components/bundle.css'), css);
  return { bytes };
}
