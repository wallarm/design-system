import type { DesignSystemMetadata } from '@wallarm-org/mcp-core';
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { findNewComponents } from './newComponents';
import {
  kebab,
  renderChangelogPage,
  renderComponentPage,
  renderComponentsMeta,
  renderTokensPage,
} from './render';

const app = path.resolve(import.meta.dirname, '..');
const ds = path.resolve(app, '../../packages/design-system');
const metadataPath = path.join(ds, 'dist/metadata/components.json');
const componentsSrc = path.join(ds, 'src/components');
const docs = path.join(app, 'docs');
const outDir = path.join(docs, 'components');

if (!existsSync(metadataPath)) {
  execSync('pnpm --filter @wallarm-org/design-system generate-metadata', { stdio: 'inherit' });
}

const metadata: DesignSystemMetadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
const storyImportBase = path.relative(outDir, componentsSrc).split(path.sep).join('/');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

let pages = 0;
for (const c of metadata.components) {
  const storyFile = c.examples[0]?.storyFile;
  const hasSubcomponents =
    !!storyFile &&
    /\bsubcomponents\s*:/.test(readFileSync(path.join(componentsSrc, storyFile), 'utf8'));
  const page = renderComponentPage(c, { storyImportBase, hasSubcomponents });
  if (!page) continue;
  writeFileSync(path.join(outDir, `${kebab(c.name)}.mdx`), page);
  pages++;
}
const newComponents = findNewComponents(
  metadata.components.map(c => c.name),
  { repoRoot: path.resolve(app, '../..'), windowDays: 30 },
);
writeFileSync(
  path.join(outDir, '_meta.json'),
  renderComponentsMeta(metadata.components, { newComponents }),
);

for (const dir of ['foundations', 'get-started', 'public'])
  mkdirSync(path.join(docs, dir), { recursive: true });
writeFileSync(path.join(docs, 'foundations/tokens.mdx'), renderTokensPage(metadata.tokens));
writeFileSync(
  path.join(docs, 'get-started/changelog.md'),
  renderChangelogPage(readFileSync(path.join(ds, 'CHANGELOG.md'), 'utf8')),
);
copyFileSync(metadataPath, path.join(docs, 'public/components.json'));

process.stdout.write(
  `docs: generated ${pages} component pages, ${newComponents.size} marked new\n`,
);
