import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

expect(read('index.html').includes('dataset.theme'), 'index.html lacks the theme script');
read('404.html');

console.log('docs build OK');
