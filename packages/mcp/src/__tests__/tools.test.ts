import { describe, expect, it } from '@rstest/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { DesignSystemMetadata } from '@wallarm-org/mcp-core';
import { formatPropsTable, formatType, paginate } from '../tools/format';
import { exampleEntries, formatComponent, getComponent } from '../tools/get-component';
import { getExampleText } from '../tools/get-example';
import { formatTokenCategory, getTokenCategory } from '../tools/get-token-category';
import { searchComponents } from '../tools/search-component';
import { searchTokens, tokenUtilities } from '../tools/search-token';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.join(__dirname, 'fixtures/components.json');
const metadata: DesignSystemMetadata = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));

describe('searchComponents', () => {
  it('finds exact match by name', () => {
    const results = searchComponents(metadata, 'Button');
    expect(results.at(0)?.name).toBe('Button');
    expect(results.at(0)?.score).toBe(100);
  });

  it('finds partial match by name', () => {
    const results = searchComponents(metadata, 'But');
    expect(results.at(0)?.name).toBe('Button');
    expect(results.at(0)?.score).toBe(80);
  });

  it('finds by description keyword', () => {
    const results = searchComponents(metadata, 'messages');
    expect(results.some(r => r.name === 'Alert')).toBe(true);
  });

  it('finds by prop name', () => {
    const results = searchComponents(metadata, 'loading');
    expect(results.some(r => r.name === 'Button')).toBe(true);
  });

  it('finds by variant option', () => {
    const results = searchComponents(metadata, 'destructive');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty for no match', () => {
    const results = searchComponents(metadata, 'zzz_nonexistent_zzz');
    expect(results).toEqual([]);
  });

  it('is case-insensitive', () => {
    const results = searchComponents(metadata, 'button');
    expect(results.at(0)?.name).toBe('Button');
  });

  it('does not match prop types', () => {
    // `minWidth: number` on Alert; "number" appears nowhere but in prop types.
    expect(searchComponents(metadata, 'number')).toEqual([]);
  });

  it('matches multi-word queries by words', () => {
    expect(searchComponents(metadata, 'full width').at(0)?.name).toBe('Button');
  });

  it('resolves aliases', () => {
    const fixture = {
      ...metadata,
      components: [...metadata.components, { ...metadata.components[0]!, name: 'Dialog' }],
    };
    expect(searchComponents(fixture, 'modal').at(0)?.name).toBe('Dialog');
    expect(searchComponents(fixture, 'confirmation modal').at(0)?.name).toBe('Dialog');
  });
});

describe('getComponent', () => {
  it('finds by exact name', () => {
    const result = getComponent(metadata, 'Button');
    expect(result).toBeDefined();
    expect(result!.name).toBe('Button');
  });

  it('finds case-insensitively', () => {
    const result = getComponent(metadata, 'alert');
    expect(result).toBeDefined();
    expect(result!.name).toBe('Alert');
  });

  it('returns undefined for unknown', () => {
    expect(getComponent(metadata, 'Unknown')).toBeUndefined();
  });
});

describe('formatComponent', () => {
  it('overview has import, props, variants and example names but no code', () => {
    const text = formatComponent(getComponent(metadata, 'Button')!);

    expect(text).toContain('# Button');
    expect(text).toContain("import { Button } from '@wallarm-org/design-system/Button'");
    expect(text).toContain('## Props');
    expect(text).toContain('## Variants');
    expect(text).toContain('## Examples (2)');
    expect(text).toContain('`Basic`');
    expect(text).not.toContain('```tsx');
    expect(text).toContain("section `'props'`");
  });

  it('lists sub-component names in the overview and details on request', () => {
    const alert = getComponent(metadata, 'Alert')!;
    expect(formatComponent(alert)).toContain('AlertIcon, AlertClose, AlertTitle');

    const icon = formatComponent(alert, { section: 'alerticon' });
    expect(icon).toContain('# Alert › AlertIcon');
    expect(icon).toContain('| `color` |');
    expect(formatComponent(alert, { section: 'subcomponents' })).toContain('### AlertClose');
  });

  it('returns all example code for section examples', () => {
    const text = formatComponent(getComponent(metadata, 'Button')!, { section: 'examples' });
    expect(text).toContain('### Basic');
    expect(text).toContain('```tsx');
    expect(text).toContain('<Button');
  });

  it('lists available sections for an unknown one', () => {
    const text = formatComponent(getComponent(metadata, 'Alert')!, { section: 'nope' });
    expect(text).toContain('Section "nope" not found');
    expect(text).toContain('AlertIcon');
  });

  it('appends the source line', () => {
    const text = formatComponent(getComponent(metadata, 'Badge')!, { source: 'Source: bundled' });
    expect(text.endsWith('_Source: bundled_')).toBe(true);
  });

  it('serves usage docs as docs/<Name>', () => {
    const c = {
      ...getComponent(metadata, 'Badge')!,
      docs: [{ name: 'Guide', markdown: '# Guide' }],
    };
    expect(formatComponent(c)).toContain('`docs/Guide`');
    expect(formatComponent(c, { section: 'docs/guide' })).toContain('# Guide');
  });
});

describe('formatType / formatPropsTable', () => {
  it('drops undefined and collapses long unions', () => {
    expect(formatType("'a' | 'b' | undefined")).toBe("'a' | 'b'");
    expect(formatType('1 | 2 | 3 | 4', 2)).toBe('1 | 2 | …(+2)');
    expect(formatType('{ a: 1 | 2 } | (() => void)', 1)).toBe('{ a: 1 | 2 } | …(+1)');
  });

  it('omits columns no prop fills and escapes pipes', () => {
    const table = formatPropsTable([{ name: 'size', type: "'s' | 'm'", required: false }]);
    expect(table.split('\n')[0]).toBe('| Prop | Type |');
    expect(table).toContain("`'s' \\| 'm'`");
  });
});

describe('paginate', () => {
  const text = Array.from({ length: 6 }, (_, i) => `## S${i}\n${'x'.repeat(900)}`).join('\n');
  const next = (p: number) => `{ page: ${p} }`;

  it('splits at headings and points at the next page', () => {
    const first = paginate(text, 1, next, 3000);
    expect(first).toContain('Page 1/');
    expect(first).toContain('{ page: 2 }');
    expect(first.length).toBeLessThanOrEqual(3000);
  });

  it('marks the last page', () => {
    expect(paginate(text, 99, next, 3000)).toContain('(last)');
  });

  it('leaves short text untouched', () => {
    expect(paginate('short', 1, next)).toBe('short');
  });
});

describe('getExampleText', () => {
  const button = getComponent(metadata, 'Button')!;

  it('returns one example by name, case-insensitively', () => {
    const text = getExampleText(button, 'fullwidth');
    expect(text).toContain('### FullWidth');
    expect(text).toContain('```tsx');
    expect(text).not.toContain('### Basic');
  });

  it('matches a near miss', () => {
    expect(getExampleText(button, 'Basci')).toContain('### Basic');
  });

  it('lists names on a miss', () => {
    const text = getExampleText(button, 'Something else');
    expect(text).toContain('not found');
    expect(text).toContain('`Basic`, `FullWidth`');
  });

  it('qualifies duplicate story names with the story file', () => {
    const c = {
      ...button,
      examples: [
        { name: 'Default', code: '<A />', storyTitle: 'X/AreaChart' },
        { name: 'Default', code: '<B />', storyTitle: 'X/PieChart' },
      ],
    };
    expect(exampleEntries(c).map(e => e.key)).toEqual(['AreaChart/Default', 'PieChart/Default']);
    expect(getExampleText(c, 'default')).toContain('matches several');
    expect(getExampleText(c, 'PieChart/Default')).toContain('<B />');
  });
});

describe('searchTokens', () => {
  it('finds exact match by name', () => {
    const results = searchTokens(metadata, '--color-slate-50');
    expect(results.at(0)?.name).toBe('--color-slate-50');
    expect(results.at(0)?.score).toBe(100);
  });

  it('finds by name without -- prefix', () => {
    const results = searchTokens(metadata, 'color-slate-50');
    expect(results.at(0)?.name).toBe('--color-slate-50');
    expect(results.at(0)?.score).toBe(100);
  });

  it('finds partial match by name', () => {
    const results = searchTokens(metadata, 'slate');
    expect(results.some(r => r.name.includes('slate'))).toBe(true);
    expect(results.at(0)?.score).toBe(60);
  });

  it('finds by value', () => {
    const results = searchTokens(metadata, '#ff6633');
    expect(results.at(0)?.name).toBe('--color-w-orange-500');
    expect(results.at(0)?.score).toBe(50);
  });

  it('finds by category name', () => {
    const results = searchTokens(metadata, 'spacing');
    expect(results.every(r => r.category === 'spacing')).toBe(true);
    expect(results.length).toBe(3);
  });

  it('returns empty for no match', () => {
    const results = searchTokens(metadata, 'zzz_nonexistent_zzz');
    expect(results).toEqual([]);
  });

  it('is case-insensitive', () => {
    const results = searchTokens(metadata, '--COLOR-SLATE-50');
    expect(results.at(0)?.name).toBe('--color-slate-50');
  });
});

describe('tokenUtilities', () => {
  it('derives Tailwind classes from token names', () => {
    expect(tokenUtilities('--color-text-primary')).toEqual(['text-text-primary']);
    expect(tokenUtilities('--color-bg-surface-2')).toEqual(['bg-bg-surface-2']);
    expect(tokenUtilities('--color-states-primary-hover')).toEqual(['bg-states-primary-hover']);
    expect(tokenUtilities('--color-focus-brand')).toEqual(['ring-focus-brand']);
    expect(tokenUtilities('--color-slate-500')).toEqual([
      'bg-slate-500',
      'text-slate-500',
      'border-slate-500',
    ]);
    expect(tokenUtilities('--spacing-8')).toContain('gap-8');
    expect(tokenUtilities('--radius-full')).toEqual(['rounded-full']);
    expect(tokenUtilities('--font-weight-medium')).toEqual(['font-medium']);
    expect(tokenUtilities('--text-sm--line-height')).toEqual([]);
    expect(tokenUtilities('--spacing')).toEqual([]);
  });

  it('finds tokens by utility class', () => {
    expect(searchTokens(metadata, 'p-4').at(0)?.name).toBe('--spacing-4');
  });
});

describe('getTokenCategory', () => {
  it('finds by exact name', () => {
    const result = getTokenCategory(metadata, 'spacing');
    expect(result).toBeDefined();
    expect(result!.name).toBe('spacing');
  });

  it('finds case-insensitively', () => {
    const result = getTokenCategory(metadata, 'COLORS-PRIMARY');
    expect(result).toBeDefined();
    expect(result!.name).toBe('colors-primary');
  });

  it('returns undefined for unknown', () => {
    expect(getTokenCategory(metadata, 'unknown')).toBeUndefined();
  });
});

describe('formatTokenCategory', () => {
  it('formats category as markdown', () => {
    const category = getTokenCategory(metadata, 'spacing')!;
    const text = formatTokenCategory(category);

    expect(text).toContain('# spacing');
    expect(text).toContain('Spacing scale values');
    expect(text).toContain('Total: 3 tokens');
    expect(text).toContain('| Token | Value | Utility |');
    expect(text).toContain('`gap-4`');
    expect(text).toContain('`--spacing-4`');
    expect(text).toContain('`4px`');
  });

  it('formats category without description', () => {
    const category = { name: 'test', tokens: [{ name: '--test', value: '1px' }] };
    const text = formatTokenCategory(category);

    expect(text).toContain('# test');
    expect(text).toContain('Total: 1 tokens');
    expect(text).not.toContain('\n\n\n');
  });
});
