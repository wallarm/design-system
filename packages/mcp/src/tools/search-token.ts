import type { DesignSystemMetadata, TokenMetadata } from '@wallarm-org/mcp-core';

export interface TokenSearchResult {
  name: string;
  value: string;
  category: string;
  utilities: string[];
  score: number;
}

/** Semantic colour family → the utilities the DS actually uses with it. */
const COLOR_FAMILY_UTILITIES: Record<string, string[]> = {
  text: ['text'],
  bg: ['bg'],
  border: ['border'],
  icon: ['text'],
  states: ['bg'],
  focus: ['ring'],
  syntax: ['text'],
};

/**
 * Tailwind v4 utility classes for a theme token (`@theme` namespaces: `--color-*`, `--spacing-*`,
 * `--radius-*`, …). `--spacing: 1px` makes every number a pixel count: `p-4` = 4px.
 */
export function tokenUtilities(tokenName: string): string[] {
  const name = tokenName.replace(/^--/, '');
  const [, namespace = '', key = ''] =
    name.match(
      /^(color|spacing|radius|shadow|blur|icon|text|leading|tracking|font-weight|font)-(.+)$/,
    ) ?? [];
  switch (namespace) {
    case 'color': {
      const family = key.split('-')[0] ?? '';
      return (COLOR_FAMILY_UTILITIES[family] ?? ['bg', 'text', 'border']).map(u => `${u}-${key}`);
    }
    case 'spacing':
      return ['p', 'm', 'gap', 'w', 'h'].map(u => `${u}-${key}`);
    case 'radius':
      return [`rounded-${key}`];
    case 'text':
      return key.endsWith('--line-height') ? [] : [`text-${key}`];
    case 'font-weight':
    case 'font':
      return [`font-${key}`];
    case '':
      return [];
    default:
      return [`${namespace}-${key}`];
  }
}

function scoreToken(
  token: TokenMetadata,
  utilities: string[],
  category: string,
  query: string,
): number {
  const q = query.toLowerCase();
  const name = token.name.toLowerCase();
  const val = token.value.toLowerCase();
  const cat = category.toLowerCase();

  // Exact token name or utility class match
  if (name === q || name === `--${q}` || utilities.includes(q)) return 100;

  // Token name starts with query (with or without --)
  if (name.startsWith(q) || name.startsWith(`--${q}`)) return 80;

  // Token name or utility contains query
  if (name.includes(q) || utilities.some(u => u.includes(q))) return 60;

  // Value matches (e.g. searching for "#ff6633" or "4px")
  if (val === q) return 50;
  if (val.includes(q)) return 40;

  // Category name matches
  if (cat === q) return 30;
  if (cat.includes(q)) return 20;

  return 0;
}

export function searchTokens(metadata: DesignSystemMetadata, query: string): TokenSearchResult[] {
  const results: TokenSearchResult[] = [];

  for (const category of metadata.tokens) {
    for (const token of category.tokens) {
      const utilities = tokenUtilities(token.name);
      const score = scoreToken(token, utilities, category.name, query);
      if (score > 0) {
        results.push({
          name: token.name,
          value: token.value,
          category: category.name,
          utilities,
          score,
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
