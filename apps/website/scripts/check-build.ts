import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import nav from '../docs/_nav.json';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, process.env.DOCS_OUT_DIR ?? 'doc_build');

const read = (file: string): string => {
  const path = resolve(out, file);
  if (!existsSync(path)) fail(`${file} is missing`);
  return readFileSync(path, 'utf8');
};

function fail(message: string): never {
  console.error(`docs build check failed: ${message}`);
  process.exit(1);
}

const expect = (ok: boolean, message: string) => {
  if (!ok) fail(message);
};

expect(
  read('llms.txt').includes('https://wallarm.github.io/design-system/'),
  'llms.txt lacks the production site URL',
);
const fallbackLinkLines = read('llms.txt')
  .split('\n')
  .filter(line => line.trimEnd().endsWith(': Source · Storybook'));
expect(
  fallbackLinkLines.length === 0,
  `llms.txt has ${fallbackLinkLines.length} page(s) described by their links line, e.g. ${fallbackLinkLines[0]}`,
);
read('llms-full.txt');

read('components/button.html');
const buttonMd = read('components/button.md');
expect(buttonMd.includes('```tsx'), 'components/button.md has no tsx code fence');
expect(
  buttonMd.includes('@wallarm-org/design-system/Button'),
  'components/button.md lacks the Button import path',
);
expect(!buttonMd.includes('StoryPreview'), 'components/button.md leaks StoryPreview');
expect(!buttonMd.includes('import('), 'components/button.md leaks import(');

const manifest: { components?: unknown[] } = JSON.parse(read('components.json'));
expect(
  Array.isArray(manifest.components) && manifest.components.length > 0,
  'components.json has no components',
);

/** Checks that every site link in `md` resolves to a built file; returns how many it checked. */
function checkLinks(file: string, md: string): number {
  let count = 0;
  for (const [, href] of md.matchAll(/\]\((https?:\/\/[^)\s#]+)/g)) {
    const { pathname } = new URL(href ?? '');
    // Storybook is deployed next to the site, not inside it.
    if (!pathname.startsWith(sitePath) || pathname.startsWith(`${sitePath}storybook/`)) continue;
    const target = pathname.slice(sitePath.length);
    expect(!target || existsSync(resolve(out, target)), `${file} links to missing ${target}`);
    count++;
  }
  return count;
}

// Guideline pages: listed in llms.txt, keep their tsx code, and every site link resolves.
const llms = read('llms.txt');
const guidelineMd = ['foundations', 'patterns', 'templates'].flatMap(dir =>
  readdirSync(resolve(out, dir))
    .filter(f => f.endsWith('.md') && f !== 'tokens.md' && f !== 'icons.md')
    .map(f => `${dir}/${f}`),
);
expect(guidelineMd.length > 0, 'no guideline pages were built');
const sitePath = new URL(llms.match(/https?:\/\/\S+?\/design-system\//)?.[0] ?? 'x:/').pathname;
for (const file of guidelineMd) {
  expect(llms.includes(`/${file})`), `llms.txt does not list ${file}`);
  const md = read(file);
  // Section indexes are cards for the section's pages, with no code of their own.
  if (
    (file.startsWith('patterns/') || file.startsWith('templates/')) &&
    !file.endsWith('/index.md')
  ) {
    expect(md.includes('```tsx'), `${file} has no tsx code fence`);
    // The built .md flattens previews to code, so count them in the generated page source.
    const mdx = readFileSync(resolve(root, 'docs', file.replace(/\.md$/, '.mdx')), 'utf8');
    const embedded = mdx.match(/<StoryPreview /g)?.length ?? 0;
    expect(
      embedded >= 2,
      `${file} embeds ${embedded} stories (min 2): reference stories with \`\`\`story blocks in packages/design-system/src/guidelines/${file}`,
    );
  }
  checkLinks(file, md);
}

// Every nav section opens on an overview: a card per page of its sidebar, all of them resolving.
for (const { link } of nav.filter(n => n.link.startsWith('/'))) {
  const file = `${link.slice(1)}index.md`;
  const md = read(file);
  expect(checkLinks(file, md) > 1, `${file} lists fewer than two pages of its section`);
}
expect(
  read('components/index.md').includes('/components/button.md)'),
  'components/index.md does not list Button',
);

expect(read('index.html').includes('dataset.theme'), 'index.html lacks the theme script');
read('404.html');

console.log('docs build OK');
