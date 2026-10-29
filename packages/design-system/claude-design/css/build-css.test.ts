import { afterAll, beforeAll, describe, expect, it } from '@rstest/core';
import postcss from 'postcss';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildTokens } from '../tokens/build-tokens';
import { buildCss, stripTokenDeclarations } from './build-css';

const outDir = mkdtempSync(path.join(tmpdir(), 'claude-design-css-'));
afterAll(() => rmSync(outDir, { recursive: true, force: true }));

describe('buildCss', () => {
  let css: string;
  let result: { bytes: number };
  let tokenNames: Set<string>;
  beforeAll(async () => {
    ({ tokenNames } = buildTokens({
      themeDir: path.resolve('src/theme'),
      outDir,
      ref: 'test@abc123',
      syncedAt: '2026-10-28T00:00:00.000Z',
    }));
    result = await buildCss({ outDir, tokenNames });
    css = readFileSync(path.join(outDir, 'components/bundle.css'), 'utf8');
  });

  it('includes canvas layouts and semantic colors that are absent from source components', () => {
    const root = postcss.parse(css);
    const selectors = new Set<string>();
    root.walkRules(rule => {
      for (const selector of rule.selectors) selectors.add(selector);
    });
    for (const selector of [
      '.bg-bg-surface-1',
      '.grid-cols-12',
      '.col-span-12',
      '.gap-24',
      '.p-144',
      '.max-w-144',
      '.rounded-24',
      '.shadow-2xl',
      '.text-text-info',
      '.text-icon-ai',
      '.border-border-danger',
    ])
      expect(selectors.has(selector)).toBe(true);
  });

  it('uses exported tokens without replacing component styles or ambient frame colors', () => {
    const declarations: string[] = [];
    postcss.parse(css).walkDecls('--color-text-primary', declaration => {
      declarations.push(declaration.toString());
    });
    expect(declarations).toEqual([]);
    expect(css).toMatch(/--color-component-app-shell-ambient-lift:\s*color-mix\(/);
    expect(css).toContain('data-frame-style');
    expect(css).toContain('app-shell-ambient-bloom');
    expect(css).toMatch(/--c:\s*var\(--color-component-app-shell-ambient-lift\)/);
  });

  it('stays within the inline CSS budget and does not duplicate font faces', () => {
    expect(result.bytes).toBe(Buffer.byteLength(css));
    expect(result.bytes).toBeLessThanOrEqual(2_000_000);
    expect(css).not.toMatch(/<\/style/i);
    expect(css).not.toMatch(/@font-face/);
    expect(css).not.toMatch(/@source|@theme\s*\{/);
  });

  it('redeclares unsupported light defaults on light artboards nested inside dark ones', () => {
    const light: Record<string, string> = {};
    postcss.parse(css).walkRules(rule => {
      if (!rule.selectors.includes('[data-theme="light"]')) return;
      rule.walkDecls(declaration => {
        light[declaration.prop] = declaration.value;
      });
    });
    expect(light['--app-shell-ambient-grain-opacity']).toBe('0.36');
    expect(light['--color-component-app-shell-ambient-lift']).toMatch(/^color-mix\(/);
    expect(light['--color-text-primary']).toBeUndefined();
  });
});

it('strips only unconditional theme declarations, preserving branded, component, and media overrides', () => {
  const css = stripTokenDeclarations(
    `
    @layer theme { :root, :host { --color-text-primary: #111; --local: 1; } }
    [data-theme="dark"] { --color-text-primary: #eee; }
    :root[data-theme='light'] { --color-text-primary: #111; }
    .component { --color-text-primary: #123; }
    :root .component { --color-text-primary: #234; }
    :root[data-frame-style='branded'] { --color-text-primary: #345; }
    @media (forced-colors: active) { :root { --color-text-primary: CanvasText; } }
  `,
    new Set(['--color-text-primary']),
  );
  const root = postcss.parse(css);
  const values: string[] = [];
  root.walkDecls('--color-text-primary', declaration => {
    values.push(declaration.value);
  });
  expect(values).toEqual(['#123', '#234', '#345', 'CanvasText']);
  expect(css).toContain('--local: 1');
});
