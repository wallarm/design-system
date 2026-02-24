import type { DesignSystemMetadata, TokenMetadata } from '@wallarm-org/mcp-core';

export interface TokenSearchResult {
  name: string;
  value: string;
  category: string;
  score: number;
}

function scoreToken(token: TokenMetadata, category: string, query: string): number {
  const q = query.toLowerCase();
  const name = token.name.toLowerCase();
  const val = token.value.toLowerCase();
  const cat = category.toLowerCase();

  // Exact token name match
  if (name === q || name === `--${q}`) return 100;

  // Token name starts with query (with or without --)
  if (name.startsWith(q) || name.startsWith(`--${q}`)) return 80;

  // Token name contains query
  if (name.includes(q)) return 60;

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
      const score = scoreToken(token, category.name, query);
      if (score > 0) {
        results.push({
          name: token.name,
          value: token.value,
          category: category.name,
          score,
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
