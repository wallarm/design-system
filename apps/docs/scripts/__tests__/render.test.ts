import { describe, expect, it } from '@rstest/core';
import type { ComponentMetadata, ExampleMetadata } from '@wallarm-org/mcp-core';
import {
  renderChangelogPage,
  renderComponentPage,
  renderComponentsMeta,
  renderPropsTable,
  renderTokensPage,
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
});

describe('renderComponentsMeta', () => {
  it('meta omits components without examples', () => {
    expect(renderComponentsMeta([button, empty])).not.toContain('button-base');
  });

  it('orders categories', () => {
    const meta = JSON.parse(renderComponentsMeta([input, button]));
    expect(meta[0]).toBe('index');
    const labels = meta.map((m: unknown) =>
      typeof m === 'string' ? m : (m as { label: string }).label,
    );
    expect(labels.indexOf('Actions')).toBeLessThan(labels.indexOf('Inputs'));
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
    expect(out).toContain('<TokenTable tokens={[');
    expect(out).toContain('| Token | Value |');
    expect(out).toContain('</TokenTable>');
  });
});
