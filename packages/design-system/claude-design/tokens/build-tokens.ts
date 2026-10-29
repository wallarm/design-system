import postcss, { type Root } from 'postcss';
import type { TokenCategory } from '@wallarm-org/mcp-core';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapColorValue, type Theme } from './map-value';

export interface Token {
  name: string;
  value: string | Record<Theme, string>;
  usage?: string;
}
interface TokenFamily {
  tokens: Token[];
  note?: string;
}
interface TypeStyle {
  name: string;
  fontSize: string;
  lineHeight?: string;
  fontWeight: number;
  letterSpacing?: string;
  usage: string;
}
interface Font {
  family: string;
  file: string;
  weight: string;
  style: string;
}
interface Typography {
  fonts: Font[];
  families: Record<string, string>;
  groups: { name: string; family: string; styles: TypeStyle[] }[];
}
export interface TokenDocument {
  name: string;
  version: number;
  color: TokenFamily & { themes: { id: Theme; name: string }[] };
  type: Typography;
  meta: {
    source: string;
    repo: string;
    ref: string;
    package: string;
    paths: { tokens: string[]; fonts: string[] };
    synced: string;
  };
  [key: string]: unknown;
}
export interface BuildTokensOptions {
  themeDir: string;
  outDir: string;
  ref: string;
  syncedAt?: string;
}
export interface BuildTokensResult {
  tokenNames: Set<string>;
  skipped: string[];
  counts: Record<string, number>;
}

const THEMES: Theme[] = ['light', 'dark'];
const NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const LENGTH = /^(?:-?(?:\d*\.)?\d+(?:px|rem|em|%)|0)$/;
const OMIT = new Set(['--temp-token', '--color-data-viz-1']);
const normalize = (value: string) => value.trim().replace(/\s+/g, ' ');
// The existing metadata tool has its own TS project. Keep it unchanged and load
// its erasable TypeScript under Node 24/tsx without importing that project here.
const { parseTokens } = createRequire(import.meta.url)(
  '../../scripts/metadata/parse-tokens.ts',
) as {
  parseTokens: (options: { themeDir: string }) => TokenCategory[];
};

function cssFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => {
      const filename = path.join(directory, entry.name);
      return entry.isDirectory()
        ? cssFiles(filename)
        : entry.name.endsWith('.css')
          ? [filename]
          : [];
    });
}

/** Only an unqualified theme boundary is safe to lift into tokens.css. */
export function themeSelector(selector: string): Theme | undefined {
  const value = selector.trim();
  if (value === ':root' || value === ':host' || value === ':where(:root)') return 'light';
  const match = /^(?::root)?\[data-theme\s*=\s*(['"]?)(light|dark)\1\s*\]$/.exec(value);
  return match?.[2] as Theme | undefined;
}

function discover(themeDir: string, skipped: Set<string>) {
  const values: Record<Theme, Map<string, string>> = { light: new Map(), dark: new Map() };
  // Reuse published discovery without changing it. The AST pass fills its multiline,
  // selector, and component-file gaps without lifting component-local declarations.
  for (const category of parseTokens({ themeDir })) {
    for (const token of category.tokens)
      values[category.name.endsWith('-dark') ? 'dark' : 'light'].set(
        token.name,
        normalize(token.value),
      );
  }
  const sources = cssFiles(themeDir);
  const parsed = new Map<string, Root>();
  for (const filename of sources) {
    const root = postcss.parse(readFileSync(filename, 'utf8'), { from: filename });
    parsed.set(filename, root);
    root.each(node => {
      let themes: Theme[] = [];
      if (node.type === 'atrule' && node.name === 'theme') themes = ['light'];
      if (node.type === 'rule') {
        const selectors = node.selectors.map(themeSelector);
        if (selectors.every(theme => theme !== undefined)) themes = selectors;
        else if (node.selector.includes('data-frame-style'))
          skipped.add(`Contextual ${node.selector} overrides remain in bundle.css.`);
      }
      if (themes.length && 'nodes' in node && node.nodes) {
        for (const declaration of node.nodes) {
          if (declaration.type !== 'decl' || !declaration.prop.startsWith('--')) continue;
          for (const theme of themes)
            values[theme].set(declaration.prop, normalize(declaration.value));
        }
      }
    });
  }
  return { values, parsed, sources };
}

function makeTypography(values: Map<string, string>, parsed: Map<string, Root>): Typography {
  const families = Object.fromEntries(
    [...values]
      .filter(([name]) => name.startsWith('--font-') && !name.startsWith('--font-weight-'))
      .map(([name, value]) => [name.slice(7), value]),
  );
  const fonts: Font[] = [];
  for (const [filename, root] of parsed) {
    if (path.basename(path.dirname(filename)) !== 'fonts') continue;
    root.walkAtRules('font-face', rule => {
      const fields: Record<string, string> = {};
      rule.walkDecls(declaration => {
        fields[declaration.prop] = normalize(declaration.value);
      });
      const file = /url\(['"]?([^'")]+)['"]?\)/.exec(fields.src ?? '')?.[1];
      if (file && fields['font-family'])
        fonts.push({
          family: fields['font-family'].replace(/^['"]|['"]$/g, ''),
          file: `fonts/${path.basename(file)}`,
          weight: fields['font-weight'] ?? '400',
          style: fields['font-style'] ?? 'normal',
        });
    });
  }
  const sizes = [...values].filter(([name]) => /^--text-[^-]+$/.test(name));
  const style = (prefix: string, name: string, value: string, weight: number): TypeStyle => {
    const size = name.slice(7);
    const tracking = values.get(`--tracking-${size}`);
    return {
      name: `${prefix}-${size}`,
      fontSize: value,
      lineHeight: values.get(`${name}--line-height`),
      fontWeight: weight,
      ...(prefix === 'heading' || prefix === 'display' ? { letterSpacing: tracking ?? '0' } : {}),
      usage: `Tailwind: text-${size} font-${prefix === 'code' ? 'mono' : 'sans-display'}${tracking && (prefix === 'heading' || prefix === 'display') ? ` tracking-${size}` : ''}.`,
    };
  };
  const weight = (name: string) => Number(values.get(`--font-weight-${name}`) ?? '400');
  const group = (
    name: string,
    prefix: string,
    family: string,
    predicate: (size: string) => boolean,
    fontWeight: number,
  ) => ({
    name,
    family,
    styles: sizes
      .filter(([size]) => predicate(size.slice(7)))
      .map(([size, value]) => style(prefix, size, value, fontWeight)),
  });
  return {
    fonts,
    families,
    groups: [
      group(
        'Body',
        'body',
        'sans-display',
        size => /^(2xs|xs|sm|base|lg|xl)$/.test(size),
        weight('normal'),
      ),
      group(
        'Heading',
        'heading',
        'sans-display',
        size => /^(sm|base|lg|xl|[2-7]xl)$/.test(size),
        weight('bold'),
      ),
      group('Display', 'display', 'sans-display', size => /^[5-9]xl$/.test(size), weight('bold')),
      group('Code', 'code', 'mono', size => /^(2xs|xs|sm|base)$/.test(size), weight('normal')),
    ].filter(entry => entry.styles.length > 0),
  };
}

function tokenFamily(name: string): string {
  if (name === 'spacing' || name.startsWith('spacing-')) return 'spacing';
  for (const prefix of ['radius', 'shadow', 'blur', 'leading', 'tracking'])
    if (name.startsWith(`${prefix}-`)) return prefix;
  if (name.startsWith('icon-')) return 'iconSize';
  if (name.startsWith('font-weight-')) return 'fontWeight';
  if (name.startsWith('text-')) return 'fontSize';
  return 'component';
}

const cssName = (name: string) => name.replaceAll('.', '\\.');
const cssValue = (value: string) =>
  value.replace(/^\{([\w.-]+)\}$/, (_, name: string) => `var(--${cssName(name)})`);
function compileCss(
  document: TokenDocument,
  families: Record<string, TokenFamily>,
): { css: string; tokenNames: Set<string> } {
  const tokenNames = new Set<string>();
  const declare = (token: Token, theme: Theme) => {
    tokenNames.add(`--${token.name}`);
    const value = typeof token.value === 'string' ? token.value : token.value[theme];
    return `  --${cssName(token.name)}: ${cssValue(value)};`;
  };
  const output = ['/* Wallarm Design System — generated from tokens.json */'];
  const themed = [...document.color.tokens, ...(families.shadow?.tokens ?? [])];
  for (const theme of THEMES) {
    // Re-declare aliases at each boundary: a nested dark artboard must resolve
    // its semantic aliases against its own primitives, not its light ancestor.
    output.push(
      `${theme === 'light' ? ':root, ' : ''}[data-theme="${theme}"] {`,
      ...themed.map(token => declare(token, theme)),
      '}',
    );
  }
  output.push(':root {');
  for (const [family, entries] of Object.entries(families)) {
    if (family !== 'shadow') output.push(...entries.tokens.map(token => declare(token, 'light')));
  }
  for (const [family, value] of Object.entries(document.type.families))
    output.push(declare({ name: `font-${family}`, value }, 'light'));
  output.push('}');
  for (const group of document.type.groups) {
    for (const style of group.styles) {
      output.push(
        `.${cssName(style.name)} {`,
        `  font-family: var(--font-${cssName(group.family)});`,
        `  font-size: ${style.fontSize};`,
        `  font-weight: ${style.fontWeight};`,
      );
      if (style.lineHeight) output.push(`  line-height: ${style.lineHeight};`);
      if (style.letterSpacing) output.push(`  letter-spacing: ${style.letterSpacing};`);
      output.push('}');
    }
  }
  for (const font of document.type.fonts)
    output.push(
      '@font-face {',
      `  font-family: ${JSON.stringify(font.family)};`,
      `  font-style: ${font.style};`,
      `  font-weight: ${font.weight};`,
      '  font-display: swap;',
      `  src: url(${JSON.stringify(font.file)}) format("woff2");`,
      '}',
    );
  return { css: `${output.join('\n')}\n`, tokenNames };
}

export function buildTokens({
  themeDir,
  outDir,
  ref,
  syncedAt,
}: BuildTokensOptions): BuildTokensResult {
  const skipped = new Set<string>();
  const { values, parsed, sources } = discover(themeDir, skipped);
  const names = [...new Set([...values.light.keys(), ...values.dark.keys()])].sort();
  const raw = (name: string, theme: Theme) => values[theme].get(name) ?? values.light.get(name);
  const concreteColor = (
    name: string,
    theme: Theme,
    seen = new Set<string>(),
  ): string | undefined => {
    if (seen.has(name) || seen.size > 16) return undefined;
    const value = raw(name, theme);
    if (!value) return undefined;
    const mapped = mapColorValue(value, theme, target => raw(target, theme)).value;
    if (!mapped) return undefined;
    const alias = /^\{(.+)\}$/.exec(mapped)?.[1];
    return alias ? concreteColor(`--${alias}`, theme, new Set([...seen, name])) : mapped;
  };
  const shadowValue = (value: string, theme: Theme) =>
    value.replace(
      /var\(\s*(--[\w.-]+)\s*\)/g,
      (original, name: string) => concreteColor(name, theme) ?? original,
    );
  const colors = new Map<string, Token>();
  const families: Record<string, TokenFamily> = {};
  for (const property of names) {
    const name = property.slice(2);
    if (OMIT.has(property)) {
      skipped.add(`${name}: source placeholder omitted.`);
      continue;
    }
    if (!NAME.test(name)) throw new Error(`Invalid token name: ${name}`);
    let light = raw(property, 'light');
    let dark = raw(property, 'dark');
    if (light === undefined || dark === undefined) {
      skipped.add(`${name}: no light value; retained in bundle.css.`);
      continue;
    }
    if (property.startsWith('--font-') && !property.startsWith('--font-weight-')) continue;
    const mappedLight = mapColorValue(light, 'light', target => raw(target, 'light'));
    const mappedDark = mapColorValue(dark, 'dark', target => raw(target, 'dark'));
    const isColor = property.startsWith('--color-') || mappedLight.value !== undefined;
    if (isColor) {
      if (!mappedLight.value || !mappedDark.value) {
        skipped.add(
          `${name}: ${mappedLight.skipped ?? mappedDark.skipped}; retained in bundle.css.`,
        );
        continue;
      }
      const alpha = /--alpha\(var\((--[\w.-]+)\)\s*\/\s*([\d.]+)%\)/.exec(light);
      colors.set(name, {
        name,
        value: { light: mappedLight.value, dark: mappedDark.value },
        usage: alpha?.[1]
          ? `= ${alpha[1].slice(2)} @ ${alpha[2]}%; source: ${light}`
          : `CSS variable: ${property}.`,
      });
      continue;
    }
    const family = tokenFamily(name);
    if (family === 'shadow') {
      light = shadowValue(light, 'light');
      dark = shadowValue(dark, 'dark');
    }
    if (light !== dark && family !== 'shadow') {
      skipped.add(
        `${name}: theme-dependent ${family} values cannot be represented; retained in bundle.css.`,
      );
      continue;
    }
    const valid =
      family === 'shadow'
        ? [light, dark].every(value => value.length <= 400 && !/var\(|url\(|[;{}<>]/.test(value))
        : /^(?:spacing|radius)$/.test(family)
          ? LENGTH.test(light)
          : light.length <= 200 &&
            /^[A-Za-z0-9 #%(),./+_-]+$/.test(light) &&
            !/var\(|url\(/.test(light);
    if (!valid) {
      skipped.add(`${name}: unsupported ${family} value; retained in bundle.css.`);
      continue;
    }
    (families[family] ??= { tokens: [] }).tokens.push({
      name,
      value: light === dark ? light : { light, dark },
      usage: `CSS variable: ${property}.`,
    });
  }
  // Validate complete chains in both themes. Dropping a dependency must also
  // drop its dependants so the platform never silently removes our aliases.
  const validAlias = (name: string, theme: Theme, seen = new Set<string>()): boolean => {
    if (seen.has(name) || seen.size > 16) return false;
    const token = colors.get(name);
    if (!token) return false;
    const value = typeof token.value === 'string' ? token.value : token.value[theme];
    const target = /^\{(.+)\}$/.exec(value)?.[1];
    if (!target) return true;
    return validAlias(target, theme, new Set([...seen, name]));
  };
  for (const name of [...colors.keys()]) {
    if (!THEMES.every(theme => validAlias(name, theme))) {
      colors.delete(name);
      skipped.add(`${name}: missing, cyclic, or excessive color alias; retained in bundle.css.`);
    }
  }
  const typography = makeTypography(values.light, parsed);
  const document: TokenDocument = {
    name: 'Wallarm Design System',
    version: 1,
    color: {
      themes: [
        { id: 'light', name: 'Light' },
        { id: 'dark', name: 'Dark' },
      ],
      tokens: [...colors.values()],
    },
    type: typography,
    ...families,
    meta: {
      source: 'github',
      repo: 'wallarm/design-system',
      ref,
      package: 'packages/design-system',
      paths: {
        tokens: sources.map(
          filename => `src/theme/${path.relative(themeDir, filename).split(path.sep).join('/')}`,
        ),
        fonts: typography.fonts.map(font => `src/theme/${font.file}`),
      },
      synced:
        syncedAt ??
        execFileSync('git', ['log', '-1', '--format=%cI'], {
          cwd: path.dirname(fileURLToPath(import.meta.url)),
          encoding: 'utf8',
        }).trim(),
    },
  };
  const counts = {
    color: colors.size,
    type: typography.groups.reduce((total, group) => total + group.styles.length, 0),
    fonts: typography.fonts.length,
    ...Object.fromEntries(
      Object.entries(families).map(([family, tokens]) => [family, tokens.tokens.length]),
    ),
  };
  if (
    counts.color > 600 ||
    counts.type > 80 ||
    counts.fonts > 4096 ||
    typography.groups.length > 12 ||
    Object.keys(families).length + 2 > 12 ||
    Object.values(families).some(family => family.tokens.length > 60)
  )
    throw new Error(`Token platform budget exceeded: ${JSON.stringify(counts)}`);
  const { css, tokenNames } = compileCss(document, families);
  if (/<\/style/i.test(css))
    throw new Error('tokens.css contains an unsafe inline style terminator');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'tokens.json'), `${JSON.stringify(document, null, 2)}\n`);
  writeFileSync(path.join(outDir, 'tokens.css'), css);
  return { tokenNames, skipped: [...skipped].sort(), counts };
}
