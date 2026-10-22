import { describe, expect, it } from '@rstest/core';
import type { ComponentMetadata, ExampleMetadata } from '@wallarm-org/mcp-core';
import {
  renderChangelogPage,
  renderComponentPage,
  renderComponentsMeta,
  renderPropsTable,
  renderTokensPage,
  titleCase,
  toStoryId,
} from '../render';

const opts = {
  storyImportBase: '../../../../packages/design-system/src/components',
  hasSubcomponents: false,
};

const basic: ExampleMetadata = {
  name: 'Basic',
  code: "import { Button } from '@wallarm-org/design-system/Button';\n\nexport const Basic = () => <Button>Hi</Button>;",
  storyFile: 'Button/Button.stories.tsx',
  storyTitle: 'Actions/Button',
};

const withIcon: ExampleMetadata = {
  name: 'WithIcon',
  code: '<Button>Icon</Button>',
  storyFile: 'Button/Button.stories.tsx',
  storyTitle: 'Actions/Button',
};

const button: ComponentMetadata = {
  name: 'Button',
  description: 'Note: a {b}',
  importPath: '@wallarm-org/design-system/Button',
  props: [
    {
      name: 'label',
      type: "'a' | 'b'",
      required: true,
      description: 'Clear {label} | for <a> links\nnext',
    },
  ],
  variants: [],
  subComponents: [],
  examples: [basic, withIcon],
};

const input: ComponentMetadata = {
  ...button,
  name: 'Input',
  importPath: '@wallarm-org/design-system/Input',
  examples: [{ ...basic, storyTitle: 'Inputs/Input', storyFile: 'Input/Input.stories.tsx' }],
};

const empty: ComponentMetadata = { ...button, name: 'ButtonBase', examples: [] };

describe('toStoryId', () => {
  it('slugs story titles', () => {
    expect(toStoryId('Data Display/Selection')).toBe('data-display-selection');
    expect(toStoryId('Patterns/Click to Copy')).toBe('patterns-click-to-copy');
  });
});

describe('renderComponentPage', () => {
  it('escapes MDX and table syntax', () => {
    expect(renderPropsTable(button.props)).toContain(
      'Clear \\{label\\} \\| for &lt;a&gt; links next',
    );
    const page = renderComponentPage(button, opts) ?? '';
    expect(page).toContain('description: "Note: a {b}"');
    expect(page).toContain('Note: a \\{b\\}');
  });

  it('falls back to a generated description', () => {
    const page = renderComponentPage({ ...button, description: '' }, opts) ?? '';
    expect(page).toContain(
      `description: "${button.name}: live examples, usage and props for the ${button.name} component."`,
    );
  });

  it('skips components without examples', () => {
    expect(renderComponentPage(empty, opts)).toBeNull();
  });

  it('renders sections in order', () => {
    const page = renderComponentPage(button, opts) ?? '';
    const idx = ['<StoryPreview', '## Usage', '## Examples', '## Props'].map(s => page.indexOf(s));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(page).toMatch(/\[Storybook\]\([^)]*--overview\)/);
    const usage = page.slice(page.indexOf('## Usage'), page.indexOf('## Examples'));
    expect(usage).toContain("import { Button } from '@wallarm-org/design-system/Button';");
  });

  it('explorer only with subcomponents', () => {
    expect(renderComponentPage(button, opts)).not.toContain('## Explorer');
    expect(renderComponentPage(button, { ...opts, hasSubcomponents: true })).toContain(
      '<Explorer load=',
    );
  });

  it('groups multi-file components', () => {
    const multi: ComponentMetadata = {
      ...button,
      name: 'FilterInput',
      examples: [
        {
          ...basic,
          storyFile: 'FilterInput/stories/FilterInput.stories.tsx',
          storyTitle: 'Patterns/FilterInput/FilterInput',
        },
        {
          ...withIcon,
          storyFile: 'FilterInput/stories/Composition.stories.tsx',
          storyTitle: 'Patterns/FilterInput/Composition',
        },
      ],
    };
    const page = renderComponentPage(multi, opts) ?? '';
    const paths = new Set([...page.matchAll(/import\('([^']+)'\)/g)].map(m => m[1]));
    expect(paths.size).toBe(2);
    expect(page).toContain('### Composition');
  });

  const heavy: ExampleMetadata = {
    name: 'InfiniteScrollWindow',
    code: '<Table virtualized="window" />',
    description: 'Loads rows on scroll.',
    storyFile: 'Table/Table.stories.tsx',
    storyTitle: 'Data Display/Table',
    tags: ['!autodocs'],
  };
  const table: ComponentMetadata = {
    ...button,
    name: 'Table',
    examples: [
      { ...basic, storyFile: 'Table/Table.stories.tsx', storyTitle: 'Data Display/Table' },
      heavy,
    ],
  };

  it('renders !autodocs examples as code with a Storybook link', () => {
    const page = renderComponentPage(table, opts) ?? '';
    const block = page.slice(page.indexOf('### Infinite scroll window'));
    expect(block).not.toContain('<StoryPreview');
    expect(block).toContain('<Table virtualized="window" />');
    const [desc, code, link] = ['Loads rows on scroll.', '```tsx', '[Open in Storybook]'].map(s =>
      block.indexOf(s),
    );
    expect(desc).toBeLessThan(code ?? -1);
    expect(code).toBeLessThan(link ?? -1);
    expect(block).toContain(
      '[Open in Storybook](https://wallarm.github.io/design-system/storybook/?path=/story/data-display-table--infinite-scroll-window)',
    );
    expect(page.match(/<StoryPreview/g)?.length).toBe(1);
  });

  it('skips !autodocs for the top preview and explorer', () => {
    const page =
      renderComponentPage(
        { ...table, examples: [heavy, table.examples[0]!] },
        { ...opts, hasSubcomponents: true },
      ) ?? '';
    const top = page.slice(0, page.indexOf('## Usage'));
    expect(top).toContain(
      "<StoryPreview load={() => import('../../../../packages/design-system/src/components/Table/Table.stories.tsx')} name='Basic'>",
    );
    expect(page).toContain("name='Basic' />");
    expect(page).not.toContain("name='InfiniteScrollWindow'");
    expect(page).toContain('### Infinite scroll window');
    expect(page).not.toContain('### Basic');

    const onlyHeavy = renderComponentPage(
      { ...table, examples: [heavy] },
      { ...opts, hasSubcomponents: true },
    );
    expect(onlyHeavy).not.toContain('<StoryPreview');
    expect(onlyHeavy).not.toContain('<Explorer');
    expect(onlyHeavy).toContain('--infinite-scroll-window)');
  });
});

describe('renderComponentsMeta', () => {
  const none = { newComponents: new Set<string>() };
  type Group = {
    label: string;
    collapsible: boolean;
    items: { label: string; link: string; tag?: string }[];
  };

  it('meta omits components without examples', () => {
    expect(renderComponentsMeta([button, empty], none)).not.toContain('button-base');
  });

  it('orders categories', () => {
    const meta = JSON.parse(renderComponentsMeta([input, button], none));
    expect(meta).not.toContain('index');
    const labels = meta.map((m: Group) => m.label);
    expect(labels.indexOf('Actions')).toBeLessThan(labels.indexOf('Inputs'));
  });

  it('groups categories as collapsible links', () => {
    const out = renderComponentsMeta([button, input], { newComponents: new Set(['Input']) });
    expect(out).toContain('"collapsible": true');
    const meta = JSON.parse(out) as (string | Group)[];
    const groups = meta.filter((m): m is Group => typeof m !== 'string');
    const items = groups.flatMap(g => g.items);
    const b = items.find(i => i.label === 'Button');
    expect(b?.link).toBe('/components/button');
    expect(b && 'tag' in b).toBe(false);
    expect(items.find(i => i.label === 'Input')?.tag).toBe('new');
  });

  it('labels the AI component category "AI Assistant"', () => {
    const ai: ComponentMetadata = {
      ...button,
      name: 'Chat',
      examples: [{ ...basic, storyTitle: 'AI/Chat' }],
    };
    const meta = renderComponentsMeta([ai], none);
    expect(meta).toContain('"label": "AI Assistant"');
    expect(meta).not.toContain('"label": "AI"');
  });
});

describe('renderChangelogPage', () => {
  it('adds heading', () => {
    expect(renderChangelogPage('## [3.3.0](x) (2026-10-22)\n')).toMatch(
      /# Changelog\n+## \[3\.3\.0\]/,
    );
  });
});

describe('renderTokensPage', () => {
  it('renderTokensPage wraps tables in TokenTable', () => {
    const out = renderTokensPage([
      { name: 'colors', tokens: [{ name: '--color-a', value: '#fff' }] },
    ]);
    expect(out).toContain('<TokenTable category="colors" tokens={[');
    expect(out).toContain('| Token | Value |');
    expect(out).toContain('</TokenTable>');
  });
});

describe('titleCase', () => {
  it('capitalizes kebab words', () => {
    expect(titleCase('colors-primary')).toBe('Colors Primary');
    expect(titleCase('semantic-dark')).toBe('Semantic Dark');
    expect(titleCase('shadow')).toBe('Shadow');
  });
});

describe('renderTokensPage headings', () => {
  it('renderTokensPage uses title-case headings', () => {
    const out = renderTokensPage([
      { name: 'colors-primary', tokens: [{ name: '--color-a', value: '#fff' }] },
    ]);
    expect(out).toContain('## Colors Primary');
    expect(out).not.toContain('## colors-primary');
  });
});
