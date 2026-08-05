#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ICONS_DIR = path.resolve(process.argv[2] || 'src/icons');
const OUT_DIR = path.resolve(process.argv[3] || ICONS_DIR);

const PROVIDER_PATHS_FILE = path.join(ICONS_DIR, 'ProviderIcon/paths/index.tsx');
const SOCIAL_PATHS_FILE = path.join(ICONS_DIR, 'SocialIcon/paths/index.tsx');
const BARREL_FILE = path.join(ICONS_DIR, 'index.ts');
const CONST_FILE = path.join(ICONS_DIR, 'module/const.ts');

function pascalCase(slug) {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function extractBalanced(text, openIndex, openChar, closeChar) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === openChar) depth++;
    else if (text[i] === closeChar) {
      depth--;
      if (depth === 0) return { content: text.slice(openIndex + 1, i) };
    }
  }
  throw new Error(`Unbalanced ${openChar}${closeChar} starting at index ${openIndex}`);
}

function findTopLevelEntries(text) {
  const keyRe = /^ {2}(['"]?)([\w-]+)\1: [{(]/gm;
  const entries = [];
  let match;
  while ((match = keyRe.exec(text))) {
    const slug = match[2];
    const openIndex = match.index + match[0].length - 1;
    const openChar = text[openIndex];
    const closeChar = openChar === '(' ? ')' : '}';
    const { content } = extractBalanced(text, openIndex, openChar, closeChar);
    entries.push({ slug, content });
  }
  return entries;
}

const providerSrc = fs.readFileSync(PROVIDER_PATHS_FILE, 'utf8');
const providerEntries = findTopLevelEntries(providerSrc).map(e => ({ slug: e.slug, jsx: e.content.trim() }));
if (providerEntries.length !== 26) throw new Error(`Expected 26 provider entries, found ${providerEntries.length}`);

const socialSrc = fs.readFileSync(SOCIAL_PATHS_FILE, 'utf8');
const socialBrandBlocks = findTopLevelEntries(socialSrc);
if (socialBrandBlocks.length !== 70) throw new Error(`Expected 70 social entries, found ${socialBrandBlocks.length}`);

const toneRe = /(original|neutral): \(/g;
const socialEntries = socialBrandBlocks.map(({ slug, content }) => {
  const tones = {};
  toneRe.lastIndex = 0;
  let m;
  while ((m = toneRe.exec(content))) {
    const openIndex = m.index + m[0].length - 1;
    tones[m[1]] = extractBalanced(content, openIndex, '(', ')').content.trim();
  }
  return { slug, tones };
});

// Exceptions verified by diffing actual artwork (see the design spec):
// slack/discord/telegram are true duplicates between ProviderIcon and
// SocialIcon (same logo, re-exported at different times) — keep only the
// SocialIcon version. whatsapp is NOT a duplicate (ProviderIcon has a
// circular gradient badge, SocialIcon has a flat glyph) — keep both under
// different names.
const PROVIDER_SKIP = new Set(['slack', 'discord', 'telegram']);
const PROVIDER_RENAME = { whatsapp: 'WhatsappBadge' };

const plan = [];

for (const { slug, jsx } of providerEntries) {
  if (PROVIDER_SKIP.has(slug)) continue;
  plan.push({ name: PROVIDER_RENAME[slug] ?? pascalCase(slug), jsx, category: 'Providers' });
}

for (const { slug, tones } of socialEntries) {
  const base = pascalCase(slug);
  if (tones.original) plan.push({ name: base, jsx: tones.original, category: 'Social' });
  if (tones.neutral) plan.push({ name: `${base}Neutral`, jsx: tones.neutral, category: 'Social' });
}

if (plan.length !== 159) throw new Error(`Expected 159 planned files, computed ${plan.length}`);

const seen = new Set();
for (const { name } of plan) {
  if (seen.has(name)) throw new Error(`Duplicate planned filename: ${name}`);
  seen.add(name);
  if (fs.existsSync(path.join(OUT_DIR, `${name}.tsx`))) {
    throw new Error(`Refusing to overwrite existing file: ${name}.tsx`);
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const { name, jsx } of plan) {
  const body = `import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from './SvgIcon';

export const ${name}: FC<SvgIconProps> = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    ${jsx}
  </SvgIcon>
);

${name}.displayName = '${name}Icon';
`;
  fs.writeFileSync(path.join(OUT_DIR, `${name}.tsx`), body);
}
console.log(`Wrote ${plan.length} icon files to ${OUT_DIR}`);

function sortKeyForLine(line) {
  const m = line.match(/^export \{ (?:type )?(\w+)/);
  return m ? m[1] : line;
}

let barrel = fs.readFileSync(BARREL_FILE, 'utf8');
const beforeLen = barrel.length;
barrel = barrel.replace(/export \{\n {2}ProviderIcon,\n(?:.*\n)*?\} from '\.\/ProviderIcon';\n/, '');
barrel = barrel.replace(/export \{\n {2}SocialIcon,\n(?:.*\n)*?\} from '\.\/SocialIcon';\n/, '');
if (barrel.length === beforeLen) throw new Error('Failed to remove ProviderIcon/SocialIcon export blocks from barrel');

const existingLines = barrel.split('\n').filter(Boolean);
const newLines = plan.map(({ name }) => `export { ${name} } from './${name}';`);
const allLines = [...existingLines, ...newLines].sort((a, b) => {
  const ka = sortKeyForLine(a);
  const kb = sortKeyForLine(b);
  return ka < kb ? -1 : ka > kb ? 1 : 0;
});
fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), `${allLines.join('\n')}\n`);
console.log('Rewrote index.ts');

let constSrc = fs.readFileSync(CONST_FILE, 'utf8');
const providerNames = plan
  .filter(p => p.category === 'Providers')
  .map(p => `    '${p.name}',`)
  .join('\n');
const socialNames = plan
  .filter(p => p.category === 'Social')
  .map(p => `    '${p.name}',`)
  .join('\n');
const newCategories = `  Providers: [\n${providerNames}\n  ],\n  Social: [\n${socialNames}\n  ],\n};`;
const before = constSrc;
constSrc = constSrc.replace(/\n\};\n/, `\n${newCategories}\n`);
if (constSrc === before) throw new Error('Failed to insert Providers/Social categories into const.ts');
fs.mkdirSync(path.dirname(path.join(OUT_DIR, 'module/const.ts')), { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'module/const.ts'), constSrc);
console.log('Rewrote module/const.ts');

console.log('\nCategory counts:', {
  Providers: plan.filter(p => p.category === 'Providers').length,
  Social: plan.filter(p => p.category === 'Social').length,
});
console.log('Dropped provider duplicates:', [...PROVIDER_SKIP].join(', '));
console.log('Renamed:', JSON.stringify(PROVIDER_RENAME));
