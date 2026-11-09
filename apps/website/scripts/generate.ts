import type { DesignSystemMetadata, GuidelinesMetadata } from '@wallarm-org/mcp-core';
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { findNewComponents } from './newComponents';
import {
  componentPageResolver,
  kebab,
  OVERVIEW,
  renderChangelogPage,
  renderComponentPage,
  renderComponentsMeta,
  renderGuidelinePage,
  renderGuidelinesMeta,
  renderSectionIndex,
  renderTemplatesIndex,
  renderTokensPage,
} from './render';

const app = path.resolve(import.meta.dirname, '..');
const ds = path.resolve(app, '../../packages/design-system');
const metadataPath = path.join(ds, 'dist/metadata/components.json');
const guidelinesPath = path.join(ds, 'dist/metadata/guidelines.json');
const componentsSrc = path.join(ds, 'src/components');
const docs = path.join(app, 'docs');
const outDir = path.join(docs, 'components');

if (!existsSync(metadataPath) || !existsSync(guidelinesPath)) {
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
writeFileSync(
  path.join(outDir, 'index.mdx'),
  renderSectionIndex(
    'Components',
    'Every component by category, with live examples, usage and props.',
  ),
);

for (const dir of ['foundations', 'get-started', 'public'])
  mkdirSync(path.join(docs, dir), { recursive: true });
writeFileSync(path.join(docs, 'foundations/tokens.mdx'), renderTokensPage(metadata.tokens));
writeFileSync(
  path.join(docs, 'get-started/changelog.md'),
  renderChangelogPage(readFileSync(path.join(ds, 'CHANGELOG.md'), 'utf8')),
);
const { guidelines }: GuidelinesMetadata = JSON.parse(readFileSync(guidelinesPath, 'utf8'));
const link = componentPageResolver(metadata.components);
const foundations = guidelines.filter(g => g.kind === 'foundation');
// Pattern and template stories live next to their markdown: src/guidelines/<dir>/<slug>.stories.tsx.
const STORY_DIRS = { pattern: 'patterns', template: 'templates' } as const;
const storyBase = (dir: string) =>
  path
    .relative(path.join(docs, dir), path.join(ds, 'src/guidelines', dir))
    .split(path.sep)
    .join('/');
for (const dir of Object.values(STORY_DIRS)) {
  rmSync(path.join(docs, dir), { recursive: true, force: true });
  mkdirSync(path.join(docs, dir), { recursive: true });
}
for (const g of guidelines)
  writeFileSync(
    path.join(docs, `${g.slug}.mdx`),
    renderGuidelinePage(
      g,
      link,
      g.kind === 'foundation' ? {} : { storyImportBase: storyBase(STORY_DIRS[g.kind]) },
    ),
  );
const patterns = guidelines.filter(g => g.kind === 'pattern');
const templates = guidelines.filter(g => g.kind === 'template');
writeFileSync(
  path.join(docs, 'patterns/index.mdx'),
  renderSectionIndex(
    'Patterns',
    'How the components combine into product screens: layouts, tables, drawers, forms, filters and feedback, with the rules behind them.',
  ),
);
writeFileSync(
  path.join(docs, 'patterns/_meta.json'),
  renderGuidelinesMeta(patterns, { before: [OVERVIEW] }),
);
writeFileSync(path.join(docs, 'templates/index.mdx'), renderTemplatesIndex());
writeFileSync(
  path.join(docs, 'templates/_meta.json'),
  renderGuidelinesMeta(templates, { before: [OVERVIEW] }),
);
writeFileSync(
  path.join(docs, 'foundations/index.mdx'),
  renderSectionIndex(
    'Foundations',
    'The tokens and rules every component is built on: spacing, color, typography, radius, elevation, layering, focus and icons.',
  ),
);
writeFileSync(
  path.join(docs, 'foundations/_meta.json'),
  renderGuidelinesMeta(foundations, { before: [OVERVIEW, 'tokens'], after: ['icons'] }),
);
copyFileSync(metadataPath, path.join(docs, 'public/components.json'));
// Story source by story name, one file per guideline, fetched by the preview dialog's "Copy code".
const storyCode = path.join(docs, 'public/story-code');
rmSync(storyCode, { recursive: true, force: true });
for (const g of [...patterns, ...templates]) {
  mkdirSync(path.dirname(path.join(storyCode, g.slug)), { recursive: true });
  writeFileSync(
    path.join(storyCode, `${g.slug}.json`),
    JSON.stringify(Object.fromEntries((g.stories ?? []).map(s => [s.name, s.code]))),
  );
}

process.stdout.write(
  `docs: generated ${pages} component pages, ${newComponents.size} marked new, ${guidelines.length} guidelines\n`,
);
