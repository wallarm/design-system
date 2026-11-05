import { describe, expect, it } from '@rstest/core';
import type { ComponentMetadata, Guideline } from '@wallarm-org/mcp-core';
import {
  componentPageResolver,
  escapeMarkdown,
  renderGuidelinePage,
  renderGuidelinesMeta,
  rewriteGuidelineLinks,
} from '../render';

const component = (name: string, subs: string[] = [], examples = 1): ComponentMetadata => ({
  name,
  description: '',
  importPath: `@wallarm-org/design-system/${name}`,
  props: [],
  variants: [],
  subComponents: subs.map(s => ({ name: s, props: [] })),
  examples: Array.from({ length: examples }, () => ({ name: 'Basic', code: '' })),
});

const link = componentPageResolver([
  component('Table', ['TableColumnMenu']),
  component('Toast'),
  component('Avatar', ['AvatarName']),
  component('ButtonBase', [], 0),
]);

const pattern = (slug: string, order: number, extra: Partial<Guideline> = {}): Guideline => ({
  slug: `patterns/${slug}`,
  kind: 'pattern',
  title: slug,
  description: 'Use when testing.',
  components: [],
  keywords: [],
  order,
  markdown: `# ${slug}\n\nBody.`,
  sections: [],
  ...extra,
});

describe('componentPageResolver', () => {
  it('links components, sub-components and prefixed names to owner pages', () => {
    expect(link('Table')).toBe('/components/table');
    expect(link('TableColumnMenu')).toBe('/components/table');
    expect(link('AvatarName')).toBe('/components/avatar');
    expect(link('Toaster')).toBe('/components/toast');
    expect(link('ButtonBase')).toBeUndefined();
    expect(link('ThemeProvider')).toBeUndefined();
  });
});

describe('rewriteGuidelineLinks', () => {
  it('turns relative .md links into site routes', () => {
    const md =
      '[a](../foundations/spacing.md) [b](./entity-table.md#rules) [c](filtering.md) [d](#x) [e](https://x.dev/a.md)';
    expect(rewriteGuidelineLinks(md, 'patterns/empty-states')).toBe(
      '[a](/foundations/spacing) [b](/patterns/entity-table#rules) [c](/patterns/filtering) [d](#x) [e](https://x.dev/a.md)',
    );
  });
});

describe('escapeMarkdown', () => {
  it('escapes prose and leaves fenced code as written', () => {
    const md = 'A "<Field> updated" {x} `<Code>`\n\n```tsx\n<Button onClick={go}>\n```\nafter {y}';
    expect(escapeMarkdown(md)).toBe(
      'A "&lt;Field&gt; updated" \\{x\\} `<Code>`\n\n```tsx\n<Button onClick={go}>\n```\nafter \\{y\\}',
    );
  });

  it('keeps a longer fence open past shorter backtick runs', () => {
    expect(escapeMarkdown('````md\n```\n{a}\n````\n{b}')).toBe('````md\n```\n{a}\n````\n\\{b\\}');
  });
});

describe('renderGuidelinePage', () => {
  it('renders frontmatter, component links under the H1 and rewritten links', () => {
    const page = renderGuidelinePage(
      pattern('entity-table', 1, {
        title: 'Entity "table"',
        components: ['Table', 'ThemeProvider'],
        markdown:
          '# Entity table\n\nSee [Spacing](../foundations/spacing.md) for {gaps}.\n\n```tsx\n<Table data={rows} />\n```',
      }),
      link,
    );
    expect(page).toBe(
      [
        '---\ntitle: "Entity \\"table\\""\ndescription: "Use when testing."\n---',
        '# Entity table',
        '**Components:** [`Table`](/components/table), `ThemeProvider`',
        'See [Spacing](/foundations/spacing) for \\{gaps\\}.',
        '```tsx\n<Table data={rows} />\n```\n',
      ].join('\n\n'),
    );
  });

  it('turns each resolved story fence into a full-bleed live preview in place', () => {
    const g = pattern('resource-list-page', 1, {
      title: 'Resource list page',
      markdown:
        '# Resource list page\n\n## Examples\n\nThe whole page.\n\nMain.\n\n```tsx story=Default\nexport const Default = () => <Page />;\n```\n\n## States',
      stories: [
        { name: 'Default', code: 'export const Default = () => <Page />;', description: 'Main.' },
      ],
    });
    const page = renderGuidelinePage(g, link, { storyImportBase: '../../src/guidelines/patterns' });
    expect(page).toContain(
      [
        '## Examples',
        'The whole page.',
        'Main.',
        "<StoryPreview load={() => import('../../src/guidelines/patterns/resource-list-page.stories.tsx')} name='Default' fullscreen>",
        '```tsx\nexport const Default = () => <Page />;\n```',
        '</StoryPreview>',
        '## States',
      ].join('\n\n'),
    );
    expect(page).not.toContain('Live example');
    expect(page).not.toContain('story=');
  });
});

describe('renderGuidelinesMeta', () => {
  it('orders pages by order, then title, around fixed pages', () => {
    const meta = renderGuidelinesMeta([pattern('z', 90), pattern('y', 90), pattern('x', 10)], {
      before: ['tokens'],
      after: ['icons'],
    });
    expect(JSON.parse(meta)).toEqual(['tokens', 'x', 'y', 'z', 'icons']);
  });
});
