import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { parseTokens } from '../parse-tokens.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const THEME_DIR = path.resolve(__dirname, '../../../src/theme');

describe('parseTokens', () => {
  const result = parseTokens({ themeDir: THEME_DIR });

  it('returns token categories', () => {
    expect(result.length).toBeGreaterThan(0);
  });

  it('parses primary colors', () => {
    const primary = result.find(c => c.name === 'colors-primary');
    expect(primary).toBeDefined();
    expect(primary!.tokens.length).toBeGreaterThan(0);

    const slate50 = primary!.tokens.find(t => t.name === '--color-slate-50');
    expect(slate50).toBeDefined();
    expect(slate50!.value).toBe('#f8fafc');
  });

  it('parses w-orange brand colors', () => {
    const primary = result.find(c => c.name === 'colors-primary');
    const wOrange = primary!.tokens.find(t => t.name === '--color-w-orange-500');
    expect(wOrange).toBeDefined();
    expect(wOrange!.value).toBe('#ff6633');
  });

  it('parses spacing tokens', () => {
    const spacing = result.find(c => c.name === 'spacing');
    expect(spacing).toBeDefined();
    expect(spacing!.tokens.find(t => t.name === '--spacing-8')!.value).toBe('8px');
  });

  it('parses typography tokens', () => {
    const typography = result.find(c => c.name === 'typography');
    expect(typography).toBeDefined();
    expect(typography!.tokens.find(t => t.name === '--text-sm')!.value).toBe('14px');
  });

  it('parses semantic tokens', () => {
    const semantic = result.find(c => c.name === 'semantic');
    expect(semantic).toBeDefined();
    expect(semantic!.tokens.find(t => t.name === '--color-text-primary')).toBeDefined();
  });

  it('parses dark mode overrides', () => {
    const dark = result.find(c => c.name === 'semantic-dark');
    expect(dark).toBeDefined();
    expect(dark!.tokens.length).toBeGreaterThan(0);
    expect(dark!.tokens.find(t => t.name === '--color-bg-page-bg')!.value).toBe(
      'var(--color-black)',
    );
  });

  it('parses radius tokens', () => {
    const radius = result.find(c => c.name === 'radius');
    expect(radius).toBeDefined();
    expect(radius!.tokens.find(t => t.name === '--radius-8')!.value).toBe('8px');
  });

  it('has category descriptions', () => {
    for (const cat of result) {
      expect(cat.description).toBeDefined();
    }
  });
});
