import fs from 'fs';
import path from 'path';
import type { TokenCategory, TokenMetadata } from '@wallarm-org/mcp-core';

/**
 * Parse @theme { ... } blocks from CSS files.
 * Extracts CSS custom property declarations (--name: value).
 * Also handles .dark { ... } overrides in semantic.css.
 */

const THEME_BLOCK_REGEX = /@theme\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gs;
const CSS_VAR_REGEX = /^\s*(--[\w-]+)\s*:\s*(.+?)\s*;/gm;

function parseThemeBlock(css: string): TokenMetadata[] {
  const tokens: TokenMetadata[] = [];

  for (const match of css.matchAll(THEME_BLOCK_REGEX)) {
    const block = match[1];

    if (block) {
      for (const varMatch of block.matchAll(CSS_VAR_REGEX)) {
        tokens.push({ name: varMatch[1], value: varMatch[2] });
      }
    }
  }

  return tokens;
}

function parseDarkOverrides(css: string): TokenMetadata[] {
  const tokens: TokenMetadata[] = [];
  const darkRegex = /\.dark\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gs;

  for (const match of css.matchAll(darkRegex)) {
    const block = match[1];

    if (block) {
      for (const varMatch of block.matchAll(CSS_VAR_REGEX)) {
        tokens.push({ name: varMatch[1], value: varMatch[2] });
      }
    }
  }

  return tokens;
}

function categoryNameFromFile(filePath: string): string {
  const base = path.basename(filePath, '.css');
  const dir = path.basename(path.dirname(filePath));

  if (dir === 'colors') return `colors-${base}`;

  return base;
}

function categoryDescription(name: string): string | undefined {
  const descriptions: Record<string, string> = {
    'colors-primary': 'Primary brand colors (slate, red, w-orange, amber, green, blue, purple)',
    'colors-secondary':
      'Secondary colors (orange, yellow, lime, emerald, teal, cyan, sky, indigo, violet, fuchsia, pink, rose)',
    'colors-grayscale': 'Grayscale palettes (gray, zinc, neutral, stone)',
    'colors-other': 'Base colors (transparent, black, white)',
    semantic: 'Semantic design tokens for text, backgrounds, borders, states, and components',
    'semantic-dark': 'Dark mode overrides for semantic tokens',
    typography: 'Font families, sizes, weights, and line heights',
    spacing: 'Spacing scale values',
    radius: 'Border radius values',
    shadow: 'Box shadow values',
    blur: 'Blur values',
    focus: 'Focus ring colors',
    icon: 'Icon size values',
  };

  return descriptions[name];
}

export interface ParseTokensOptions {
  themeDir: string;
}

export function parseTokens({ themeDir }: ParseTokensOptions): TokenCategory[] {
  const categories: TokenCategory[] = [];

  const cssFiles = [
    'colors/primary.css',
    'colors/secondary.css',
    'colors/grayscale.css',
    'colors/other.css',
    'spacing.css',
    'typography.css',
    'radius.css',
    'shadow.css',
    'blur.css',
    'focus.css',
    'icon.css',
    'semantic.css',
  ];

  for (const file of cssFiles) {
    const filePath = path.join(themeDir, file);
    if (!fs.existsSync(filePath)) continue;

    const css = fs.readFileSync(filePath, 'utf-8');
    const name = categoryNameFromFile(filePath);
    const tokens = parseThemeBlock(css);

    if (tokens.length > 0) {
      categories.push({
        name,
        description: categoryDescription(name),
        tokens,
      });
    }

    // Handle .dark overrides in semantic.css
    if (file === 'semantic.css') {
      const darkTokens = parseDarkOverrides(css);
      if (darkTokens.length > 0) {
        categories.push({
          name: 'semantic-dark',
          description: categoryDescription('semantic-dark'),
          tokens: darkTokens,
        });
      }
    }
  }

  return categories;
}
