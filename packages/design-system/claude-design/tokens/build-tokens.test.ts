import { afterAll, beforeAll, describe, expect, it } from '@rstest/core';
import postcss from 'postcss';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildTokens, type TokenDocument } from './build-tokens';
import { mapColorValue } from './map-value';

const temporary = mkdtempSync(path.join(tmpdir(), 'claude-design-tokens-'));
const themeDir = path.resolve('src/theme');
const options = {
  themeDir,
  outDir: temporary,
  ref: 'test@abc123',
  syncedAt: '2026-10-28T10:00:00.000Z',
};
afterAll(() => rmSync(temporary, { recursive: true, force: true }));

describe('mapColorValue', () => {
  it.each([
    ['#F8FAFC', '#f8fafc'],
    ['var(--color-white)', '{color-white}'],
    ['--alpha(var(--color-white) / 30%)', 'rgba(255, 255, 255, 0.3)'],
    ['--alpha(var(--color-short) / 50%)', 'rgba(170, 187, 204, 0.5)'],
    ['oklch(0.9 0.03 40)', 'oklch(0.9 0.03 40)'],
    ['rgb(20 40 60 / 20%)', 'rgb(20 40 60 / 20%)'],
  ])('maps %s to a platform color', (raw, value) => {
    expect(
      mapColorValue(
        raw,
        'light',
        name => ({ '--color-white': '#FFFFFF', '--color-short': '#abc' })[name],
      ),
    ).toEqual({ value });
  });

  it.each([
    'color-mix(in srgb, var(--color-white), black)',
    'transparent',
    'currentColor',
    'rgb(var(--red) 0 0)',
    'red',
  ])('reports unsupported %s', raw => {
    expect(mapColorValue(raw, 'dark', () => undefined).skipped).toBeTruthy();
  });

  it('resolves alpha aliases and rejects missing colors and cycles', () => {
    const values: Record<string, string> = {
      '--alias': 'var(--color)',
      '--color': '#102030',
      '--cycle': 'var(--cycle)',
    };
    expect(mapColorValue('--alpha(var(--alias) / 50%)', 'dark', name => values[name]).value).toBe(
      'rgba(16, 32, 48, 0.5)',
    );
    expect(
      mapColorValue('--alpha(var(--missing) / 50%)', 'light', name => values[name]).skipped,
    ).toBeTruthy();
    expect(
      mapColorValue('--alpha(var(--cycle) / 50%)', 'light', name => values[name]).skipped,
    ).toBeTruthy();
  });
});

describe('buildTokens on the real theme', () => {
  let result: ReturnType<typeof buildTokens>;
  let document: TokenDocument;
  let css: string;
  beforeAll(() => {
    result = buildTokens(options);
    document = JSON.parse(readFileSync(path.join(temporary, 'tokens.json'), 'utf8'));
    css = readFileSync(path.join(temporary, 'tokens.css'), 'utf8');
  });

  it('exports both themes, valid aliases, source metadata, and no placeholders', () => {
    expect(document.color.themes.map(theme => theme.id)).toEqual(['light', 'dark']);
    expect(document.color.tokens.find(token => token.name === 'color-text-primary')?.value).toEqual(
      { light: '{color-slate-900}', dark: '{color-slate-50}' },
    );
    expect(
      document.color.tokens.find(token => token.name === 'animated-bg-caught-dot')?.value,
    ).toEqual({ light: '{color-green-500}', dark: '{color-green-300}' });
    expect(document.meta).toMatchObject({
      source: 'github',
      ref: 'test@abc123',
      synced: options.syncedAt,
    });
    expect(result.tokenNames.has('--temp-token')).toBe(false);
    expect(result.tokenNames.has('--color-data-viz-1')).toBe(false);
    const names = new Set(document.color.tokens.map(token => token.name));
    for (const token of document.color.tokens) {
      for (const value of typeof token.value === 'string'
        ? [token.value]
        : Object.values(token.value)) {
        const alias = /^\{(.+)\}$/.exec(value);
        if (alias?.[1]) expect(names.has(alias[1])).toBe(true);
        else expect(value).not.toMatch(/var\(|color-mix\(|transparent|currentColor/);
      }
    }
  });

  it('respects platform budgets and keeps typography classes out of Tailwind’s text namespace', () => {
    expect(result.counts.color).toBeGreaterThan(500);
    expect(result.counts.color).toBeLessThanOrEqual(600);
    expect(
      Object.keys(document).filter(key => key !== 'name' && key !== 'version' && key !== 'meta')
        .length,
    ).toBeLessThanOrEqual(12);
    for (const [family, count] of Object.entries(result.counts)) {
      if (family !== 'color' && family !== 'type' && family !== 'fonts')
        expect(count).toBeLessThanOrEqual(60);
    }
    for (const name of result.tokenNames)
      expect(name.slice(2)).toMatch(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/);
    const styles = document.type.groups.flatMap(group => group.styles);
    expect(styles.some(style => style.name === 'body-sm' && style.usage.includes('text-sm'))).toBe(
      true,
    );
    expect(styles.every(style => !style.name.startsWith('text-'))).toBe(true);
    expect(document.type.fonts).toContainEqual({
      family: 'Geist-Variable',
      file: 'fonts/Geist-Variable.woff2',
      weight: '100 900',
      style: 'normal',
    });
    expect(css).not.toMatch(/\.text-/);
  });

  it('compiles aliases on each theme boundary and emits the declared token set', () => {
    expect(css.split('\n')[0]).toBe('/* Wallarm Design System — generated from tokens.json */');
    const parsed = postcss.parse(css);
    const declared = new Set<string>();
    parsed.walkDecls(declaration => {
      if (declaration.prop.startsWith('--')) declared.add(declaration.prop);
    });
    expect([...declared].sort()).toEqual([...result.tokenNames].sort());
    const dark = parsed.nodes.find(
      node => node.type === 'rule' && node.selector === '[data-theme="dark"]',
    );
    expect(dark?.toString()).toContain('--color-text-primary: var(--color-slate-50)');
    expect(dark?.toString()).toContain('--color-text-primary-fixed: var(--color-slate-900)');
    expect(css).toContain('url("fonts/Geist-Variable.woff2")');
    expect(css).not.toMatch(/<\/style/i);
  });

  it('resolves themed shadow color references into platform-compatible values', () => {
    const shadow = document.shadow as { tokens: { name: string; value: Record<string, string> }[] };
    const medallion = shadow.tokens.find(token => token.name === 'shadow-empty-state-medallion');
    expect(medallion?.value.light).toContain('inset 0 0 0 1px rgba(202, 213, 226, 0.7)');
    expect(medallion?.value.dark).toContain('inset 0 0 0 1px rgba(255, 255, 255, 0.13)');
    expect(medallion?.value.light).not.toContain('var(');
    expect(result.tokenNames.has('--shadow-empty-state-medallion')).toBe(true);
  });

  it('generates identical bytes twice for the same source ref', () => {
    const before = readFileSync(path.join(temporary, 'tokens.json'), 'utf8');
    buildTokens(options);
    expect(readFileSync(path.join(temporary, 'tokens.json'), 'utf8')).toBe(before);
    expect(readFileSync(path.join(temporary, 'tokens.css'), 'utf8')).toBe(css);
  });
});

describe('theme discovery and validation', () => {
  it('handles quoted theme selectors while retaining contextual and unsupported declarations in CSS', () => {
    const source = path.join(temporary, 'fixture');
    mkdirSync(path.join(source, 'components'), { recursive: true });
    writeFileSync(
      path.join(source, 'semantic.css'),
      `@theme {
      --color-base: #ABC; --color-alias: var(--color-base); --color-broken: var(--missing);
      --color-cycle-a: var(--color-cycle-b); --color-cycle-b: var(--color-cycle-a);
      --color-mixed: color-mix(in srgb, var(--color-base), white);
      --color-dependent: var(--color-mixed); --color-half: #123456;
    }
    :root[data-theme='dark'] { --color-base: #DEF; --color-half: currentColor; }
    :root[data-frame-style='branded'] { --color-base: #f00; }
    .component { --color-local: #f00; }
    `,
    );
    writeFileSync(
      path.join(source, 'components', 'example.css'),
      `:root { --component-color: var(--color-base); --component-offset: 24px; --component-opacity: 0.6; }
      [data-theme="dark"] { --component-opacity: 0.3; }
      :root[data-theme='dark'][data-frame-style='branded'] { --component-offset: 8px; }`,
    );
    const built = buildTokens({
      ...options,
      themeDir: source,
      outDir: path.join(source, 'output'),
    });
    const data: TokenDocument = JSON.parse(
      readFileSync(path.join(source, 'output/tokens.json'), 'utf8'),
    );
    expect(data.color.tokens.find(token => token.name === 'color-base')?.value).toEqual({
      light: '#abc',
      dark: '#def',
    });
    expect(built.tokenNames.has('--component-color')).toBe(true);
    expect(built.tokenNames.has('--component-offset')).toBe(true);
    for (const invalid of [
      '--color-broken',
      '--color-cycle-a',
      '--color-cycle-b',
      '--color-dependent',
      '--color-half',
      '--component-opacity',
      '--color-local',
    ]) {
      expect(built.tokenNames.has(invalid)).toBe(false);
    }
    expect(
      built.skipped.some(reason => reason.includes('color-broken') && reason.includes('alias')),
    ).toBe(true);
    expect(
      built.skipped.some(
        reason => reason.includes('component-opacity') && reason.includes('theme'),
      ),
    ).toBe(true);
  });
});
