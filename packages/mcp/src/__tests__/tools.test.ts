import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import type { DesignSystemMetadata } from '@wallarm-org/mcp-core';
import { formatComponentDetails, getComponent } from '../tools/get-component';
import { formatTokenCategory, getTokenCategory } from '../tools/get-token-category';
import { searchComponents } from '../tools/search-component';
import { searchTokens } from '../tools/search-token';

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

describe('formatComponentDetails', () => {
  it('formats Button as markdown', () => {
    const button = getComponent(metadata, 'Button')!;
    const text = formatComponentDetails(button);

    expect(text).toContain('# Button');
    expect(text).toContain('import { Button }');
    expect(text).toContain('@wallarm-org/design-system/Button');
    expect(text).toContain('## Props');
    expect(text).toContain('variant');
    expect(text).toContain('## Variants');
  });

  it('formats Alert with sub-components', () => {
    const alert = getComponent(metadata, 'Alert')!;
    const text = formatComponentDetails(alert);

    expect(text).toContain('## Sub-components');
    expect(text).toContain('AlertIcon');
    expect(text).toContain('AlertClose');
  });

  it('formats Button with usage examples', () => {
    const button = getComponent(metadata, 'Button')!;
    const text = formatComponentDetails(button);

    expect(text).toContain('## Usage Examples');
    expect(text).toContain('### Basic');
    expect(text).toContain('```tsx');
    expect(text).toContain('<Button');
  });

  it('formats Alert with usage examples', () => {
    const alert = getComponent(metadata, 'Alert')!;
    const text = formatComponentDetails(alert);

    expect(text).toContain('## Usage Examples');
    expect(text).toContain('### WithCloseButton');
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
    expect(text).toContain('| Token | Value |');
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
