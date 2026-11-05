import { describe, expect, it } from '@rstest/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { designSystemMetadataSchema } from '@wallarm-org/mcp-core';
import { paginate, RESPONSE_LIMIT } from '../tools/format';
import { componentSections, exampleEntries, formatComponent } from '../tools/get-component';
import { getExampleText } from '../tools/get-example';
import { formatTokenCategory } from '../tools/get-token-category';
import { ALIASES } from '../tools/search-component';

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
describe.skipIf(!fs.existsSync(REAL_METADATA))('response budget (real metadata)', () => {
  const metadata = designSystemMetadataSchema.parse(
    JSON.parse(fs.readFileSync(REAL_METADATA, 'utf-8')),
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

  it('every search alias points at a real component', () => {
    const names = new Set(metadata.components.map(c => c.name));
    const missing = Object.values(ALIASES)
      .flat()
      .filter(n => !names.has(n));
    expect(missing).toEqual([]);
  });
});
