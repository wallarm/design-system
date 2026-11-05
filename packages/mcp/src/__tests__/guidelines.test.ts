import { describe, expect, it } from '@rstest/core';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { guidelinesMetadataSchema } from '@wallarm-org/mcp-core';
import { loadGuidelines, loadMetadata } from '../metadata';
import {
  buildInstructions,
  formatGuidelineList,
  formatRelatedGuidelines,
  getGuidelineText,
  listGuidelines,
  nearestSlugs,
  relatedGuidelines,
} from '../tools/guidelines';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENTS_PATH = path.join(__dirname, 'fixtures/components.json');
const guidelines = guidelinesMetadataSchema.parse(
  JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/guidelines.json'), 'utf-8')),
);

describe('loading', () => {
  it('loads guidelines.json next to the resolved components.json', async () => {
    const { metadataPath } = await loadMetadata([
      'node',
      'mcp',
      '--metadata-path',
      COMPONENTS_PATH,
    ]);
    expect(loadGuidelines(metadataPath)?.guidelines.length).toBe(guidelines.guidelines.length);
  });

  it('ignores a malformed or incompatible guidelines.json instead of throwing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-'));
    const file = path.join(dir, 'guidelines.json');
    const warnings: string[] = [];
    const warn = (m: string) => warnings.push(m);
    fs.writeFileSync(file, '{ truncated');
    expect(loadGuidelines(path.join(dir, 'components.json'), warn)).toBeUndefined();
    fs.writeFileSync(file, JSON.stringify({ version: '1.0.0' }));
    expect(loadGuidelines(path.join(dir, 'components.json'), warn)).toBeUndefined();
    expect(warnings).toHaveLength(2);
    fs.rmSync(dir, { recursive: true });
  });

  it('drops guidelines of an unknown kind (newer design-system)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-'));
    const recipe = { ...guidelines.guidelines[0], slug: 'recipes/x', kind: 'recipe' };
    fs.writeFileSync(
      path.join(dir, 'guidelines.json'),
      JSON.stringify({ ...guidelines, guidelines: [...guidelines.guidelines, recipe] }),
    );
    expect(loadGuidelines(path.join(dir, 'components.json'))?.guidelines.map(g => g.slug)).toEqual(
      guidelines.guidelines.map(g => g.slug),
    );
    fs.rmSync(dir, { recursive: true });
  });

  it('returns undefined when guidelines.json is absent (older design-system)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-'));
    expect(loadGuidelines(path.join(dir, 'components.json'))).toBeUndefined();
    fs.rmSync(dir, { recursive: true });
  });
});

describe('buildInstructions', () => {
  it('puts the rules first and the tool routing after', () => {
    const text = buildInstructions(guidelines.rules);
    expect(text.startsWith('Use DS components')).toBe(true);
    expect(text).toContain('`list_guidelines` / `get_guideline`');
    expect(text).toContain('before composing a screen');
  });
});

describe('list_guidelines', () => {
  it('filters by kind', () => {
    expect(listGuidelines(guidelines, 'pattern').map(g => g.slug)).toEqual([
      'patterns/empty-states',
    ]);
    expect(listGuidelines(guidelines)).toHaveLength(2);
  });

  it('formats slug, title, description and components', () => {
    const text = formatGuidelineList(listGuidelines(guidelines, 'pattern'));
    expect(text).toContain('**patterns/empty-states** — Empty states: Use when');
    expect(text).toContain('Components: Button');
  });
});

describe('get_guideline', () => {
  it('returns full markdown by slug, base name or .md path', () => {
    for (const slug of ['patterns/empty-states', 'empty-states', 'patterns/empty-states.md']) {
      expect(getGuidelineText(guidelines, slug).startsWith('# Empty states')).toBe(true);
    }
  });

  it('accepts relative markdown links, with the #anchor as the section', () => {
    expect(getGuidelineText(guidelines, './empty-states.md').startsWith('# Empty states')).toBe(
      true,
    );
    expect(getGuidelineText(guidelines, '../foundations/spacing.md#rules')).toMatch(
      /^# Spacing — Rules/,
    );
  });

  it('returns one section by id or heading', () => {
    expect(getGuidelineText(guidelines, 'empty-states', 'What your app owns')).toMatch(
      /^# Empty states — What your app owns\n\nCopy text/,
    );
    expect(getGuidelineText(guidelines, 'empty-states', 'rules')).toContain('Center');
  });

  it('lists sections for an unknown section', () => {
    expect(getGuidelineText(guidelines, 'spacing', 'nope')).toContain(
      'Available sections: what-you-use, rules, examples, reference',
    );
  });

  it('lists pattern stories in the overview and serves their code as the stories section', () => {
    const withStories = {
      ...guidelines,
      guidelines: guidelines.guidelines.map(g =>
        g.slug === 'patterns/empty-states'
          ? {
              ...g,
              stories: [
                {
                  name: 'Default',
                  code: 'export const Default = () => <Page />;',
                  description: 'Main.',
                },
                { name: 'NoResults', code: 'x'.repeat(50_000) },
              ],
            }
          : g,
      ),
    };
    expect(getGuidelineText(withStories, 'empty-states')).toContain(
      "Live stories (Storybook `Patterns/Empty states`): Default, NoResults. Full, runnable code: `get_guideline({ slug: 'patterns/empty-states', section: 'stories' })`",
    );
    const first = getGuidelineText(withStories, 'empty-states', 'stories');
    expect(first).toContain(
      '## Default\n\nMain.\n\n```tsx\nexport const Default = () => <Page />;\n```',
    );
    expect(first).toContain("section: 'stories', page: 2");
    expect(getGuidelineText(withStories, 'empty-states', 'stories', 2)).toContain('xxxx');
    for (const page of [1, 2, 3]) {
      expect(
        getGuidelineText(withStories, 'empty-states', 'stories', page).length,
      ).toBeLessThanOrEqual(40_000);
    }
    expect(getGuidelineText(withStories, 'empty-states', 'nope')).toMatch(/related, stories$/);
    expect(getGuidelineText(guidelines, 'empty-states')).not.toContain('Live stories');
  });

  it('suggests nearest slugs for an unknown slug', () => {
    expect(nearestSlugs(guidelines, 'empty-state')[0]).toBe('patterns/empty-states');
    expect(nearestSlugs(guidelines, 'gap')[0]).toBe('foundations/spacing');
    expect(getGuidelineText(guidelines, 'spacng')).toContain('Did you mean: foundations/spacing');
  });
});

describe('related guidelines', () => {
  it('finds guidelines that reference a component', () => {
    expect(relatedGuidelines(guidelines, 'button').map(g => g.slug)).toEqual([
      'patterns/empty-states',
    ]);
    expect(formatRelatedGuidelines(relatedGuidelines(guidelines, 'Alert'))).toContain(
      'Related guidelines (read with `get_guideline`): foundations/spacing (Spacing)',
    );
    expect(formatRelatedGuidelines(relatedGuidelines(guidelines, 'Badge'))).toBe('');
  });
});
