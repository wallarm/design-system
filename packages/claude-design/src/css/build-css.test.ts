import { afterAll, beforeAll, describe, expect, it } from '@rstest/core';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import postcss from 'postcss';
import { DESIGN_SYSTEM_DIR } from '../config';
import { buildTokens } from '../tokens/build-tokens';
import { buildCss, definedClasses, stripTokenDeclarations } from './build-css';

const outDir = mkdtempSync(path.join(tmpdir(), 'claude-design-css-'));
afterAll(() => rmSync(outDir, { recursive: true, force: true }));

describe('buildCss', () => {
  let css: string;
  let result: Awaited<ReturnType<typeof buildCss>>;
  let tokenNames: Set<string>;
  beforeAll(async () => {
    ({ tokenNames } = buildTokens({
      themeDir: path.resolve(DESIGN_SYSTEM_DIR, 'src/theme'),
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

  it('ships the author layout kit on the token scale', () => {
    const classes = new Set(definedClasses(css));
    for (const name of [
      'space-y-16',
      'space-x-8',
      'divide-y',
      'divide-x',
      'divide-border-primary-light',
      'md:grid-cols-3',
      'lg:col-span-6',
      'sm:flex-row',
      'md:hidden',
      'xl:block',
      'md:p-24',
      'lg:gap-32',
      'w-1/2',
      'w-1/3',
      'w-2/3',
      'w-1/4',
      'w-3/4',
      'max-w-sm',
      'max-w-7xl',
      'max-w-screen-lg',
      'hover:bg-bg-surface-2',
      'hover:border-border-strong-primary',
      'first:pt-0',
      'last:pb-0',
      'last:border-b-0',
      'text-md',
    ])
      expect(classes.has(name), name).toBe(true);
  });

  it('declares every theme token bundle.css reads in tokens.css', () => {
    const tokens = readFileSync(path.join(outDir, 'tokens.css'), 'utf8');
    const declared = new Set(
      [...`${tokens}\n${css}`.matchAll(/(--[\w\\.-]+)\s*:/g)].map(([, name]) => name),
    );
    // Runtime variables (zag positioning, inline styles) are set by components, not tokens.
    const theme =
      /^--(?:color|spacing|text|radius|shadow|font|leading|tracking|blur|icon|container|breakpoint)-/;
    const undeclared = [...css.matchAll(/var\(\s*(--[\w\\.-]+)\s*\)/g)]
      .map(([, name = '']) => name)
      .filter(name => theme.test(name) && !declared.has(name));
    expect([...new Set(undeclared)]).toEqual([]);
  });

  it('lets layout-kit and component structural selectors reach through canvas wrappers', () => {
    expect(css).toContain(':where(.sc-host-x) { border-radius: inherit; }');
    expect(css).toMatch(/\.last\\:pb-0:last-child:where\(:not\(\.sc-host-x > \*\)\)/);
    // Forms with no wrapper-tolerant rewrite keep their selector; none may be a layout-kit class.
    expect(result.wrapperSkipped.length).toBeLessThanOrEqual(30);
    for (const reason of result.wrapperSkipped)
      expect(reason).not.toMatch(
        /`\.(?:space-|divide-|(?:first|last)\\:(?:p|border)|hover\\:(?:bg|border)-)/,
      );
  });

  it('writes UTILITIES.md listing exactly the authorable classes', () => {
    const utilities = readFileSync(path.join(outDir, 'components/UTILITIES.md'), 'utf8');
    expect(utilities).toContain('**No other class exists**');
    expect(utilities).toContain('no JIT');
    for (const name of definedClasses(css)) expect(utilities).toContain(`\`${name}\``);
    expect(utilities).not.toContain('`p-5`');
    expect(utilities).not.toContain('sc-host-x`');
  });

  it('defines every class the root README tells authors to write', () => {
    const readme = readFileSync(new URL('../docs/readme-root.md', import.meta.url), 'utf8');
    const advertised = [
      // The "Here" column of the Tailwind-habit translation table.
      ...readme.split('\n').flatMap(line => (/^\| `/.test(line) ? [line.split('|')[2] ?? ''] : [])),
      readme.split('## Layout on a canvas')[1]?.split('\n## ')[0] ?? '',
    ]
      .flatMap(text => [...text.matchAll(/`([^`]+)`/g)].map(([, code = '']) => code))
      .flatMap(code => code.split(' '))
      .filter(name => /^[a-z0-9:/-]+$/.test(name) && /[-:]/.test(name) && !name.endsWith(':'))
      .filter(name => name !== 'w-384'); // named as the class that does not exist
    expect(advertised.length).toBeGreaterThan(20);
    const classes = new Set(definedClasses(css));
    expect(advertised.filter(name => !classes.has(name))).toEqual([]);
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
