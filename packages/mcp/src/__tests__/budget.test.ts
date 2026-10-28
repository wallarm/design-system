import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { describe, expect, it } from '@rstest/core';
import { designSystemMetadataSchema, guidelinesMetadataSchema } from '@wallarm-org/mcp-core';

import { paginate, RESPONSE_LIMIT } from '../tools/format';
import {
  componentSections,
  exampleEntries,
  findSubComponentOwner,
  formatComponent,
  getComponent,
} from '../tools/get-component';
import { getExampleText } from '../tools/get-example';
import { formatTokenCategory } from '../tools/get-token-category';
import { getGuidelineText } from '../tools/guidelines';
import { ALIASES, searchComponents } from '../tools/search-component';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REAL_METADATA = path.resolve(
  __dirname,
  '../../../design-system/dist/metadata/components.json',
);

/** Every page of a paginated response (pages are announced as `Page i/N`). */
const allPages = (render: (page: number) => string): string[] => {
  const first = render(1);
  const total = Number(first.match(/Page \d+\/(\d+)/)?.[1] ?? 1);
  return [first, ...Array.from({ length: total - 1 }, (_, i) => render(i + 2))];
};

// Runs against the built design system (`pnpm --filter @wallarm-org/design-system build`).
// skipIf still runs the describe body at collection, so the read itself must be guarded:
// CI's quality job runs tests before any package is built.
const hasRealMetadata = fs.existsSync(REAL_METADATA);

describe.skipIf(!hasRealMetadata)('response budget (real metadata)', () => {
  const metadata = designSystemMetadataSchema.parse(
    hasRealMetadata
      ? JSON.parse(fs.readFileSync(REAL_METADATA, 'utf-8'))
      : { version: '0.0.0', generatedAt: '', components: [], tokens: [] },
  );
  const source = 'Source: installed @wallarm-org/design-system v0.0.0';

  it.each(metadata.components.map(c => [c.name, c] as const))(
    '%s: every get_component mode and example stays under the limit',
    (_, component) => {
      for (const section of [undefined, ...componentSections(component)]) {
        for (const text of allPages(page =>
          formatComponent(component, { section, page, source, related: '' }),
        )) {
          expect(text.length, `section ${section ?? '(overview)'}`).toBeLessThanOrEqual(
            RESPONSE_LIMIT,
          );
        }
      }
      for (const { key } of exampleEntries(component)) {
        for (const text of allPages(page => getExampleText(component, key, page))) {
          expect(text.length).toBeLessThanOrEqual(RESPONSE_LIMIT);
          expect(text).toContain('```tsx');
        }
      }
    },
  );

  it('keeps Table and SimpleCharts overviews on one page', () => {
    for (const name of ['Table', 'SimpleCharts']) {
      const c = metadata.components.find(x => x.name === name);
      expect(c).toBeDefined();
      expect(formatComponent(c!, {})).not.toContain('Page 1/');
    }
  });

  it('every token category stays under the limit', () => {
    for (const category of metadata.tokens) {
      for (const text of allPages(page =>
        paginate(formatTokenCategory(category), page, next => String(next)),
      )) {
        expect(text.length).toBeLessThanOrEqual(RESPONSE_LIMIT);
      }
    }
  });

  it('every guideline and its stories section stay under the limit', () => {
    const guidelinesPath = path.join(path.dirname(REAL_METADATA), 'guidelines.json');
    if (!fs.existsSync(guidelinesPath)) return;
    const guidelines = guidelinesMetadataSchema.parse(
      JSON.parse(fs.readFileSync(guidelinesPath, 'utf-8')),
    );
    for (const g of guidelines.guidelines) {
      expect(getGuidelineText(guidelines, g.slug).length).toBeLessThanOrEqual(RESPONSE_LIMIT);
      if (!g.stories?.length) continue;
      for (const text of allPages(page => getGuidelineText(guidelines, g.slug, 'stories', page))) {
        expect(text.length).toBeLessThanOrEqual(RESPONSE_LIMIT);
      }
    }
  });

  it('every component a guideline lists resolves through get_component', () => {
    const guidelinesPath = path.join(path.dirname(REAL_METADATA), 'guidelines.json');
    if (!fs.existsSync(guidelinesPath)) return;
    const { guidelines } = JSON.parse(fs.readFileSync(guidelinesPath, 'utf-8')) as {
      guidelines: { slug: string; components: string[] }[];
    };
    const missing = guidelines.flatMap(g =>
      g.components
        .filter(n => /^[A-Z]/.test(n))
        .filter(n => !getComponent(metadata, n) && !findSubComponentOwner(metadata, n))
        .map(n => `${g.slug}: ${n}`),
    );
    expect(missing).toEqual([]);
  });

  it.each(['bulk delete', 'bulk actions', 'row selection', 'action bar'])(
    '"%s" finds Table first',
    query => {
      expect(searchComponents(metadata, query)[0]?.name).toBe('Table');
    },
  );

  it('"sidebar" finds the shells, never the internal NavPanel', () => {
    const names = searchComponents(metadata, 'sidebar').map(c => c.name);
    expect(names).toEqual(expect.arrayContaining(['RemoteShell', 'NavRail', 'AppShell']));
    expect(metadata.components.map(c => c.name)).not.toContain('NavPanel');
  });

  it('a spaced component name ("notification center") finds that component first', () => {
    expect(searchComponents(metadata, 'notification center')[0]?.name).toBe('NotificationCenter');
  });

  it('every search alias points at a real component', () => {
    const names = new Set(metadata.components.map(c => c.name));
    const missing = Object.values(ALIASES)
      .flat()
      .filter(n => !names.has(n));
    expect(missing).toEqual([]);
  });
});
