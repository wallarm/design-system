import type { DesignSystemMetadata, TokenCategory } from '@wallarm-org/mcp-core';

import { tokenUtilities } from './search-token';

export function getTokenCategory(
  metadata: DesignSystemMetadata,
  name: string,
): TokenCategory | undefined {
  return metadata.tokens.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export function formatTokenCategory(category: TokenCategory): string {
  const lines: string[] = [];

  lines.push(`# ${category.name}`);
  if (category.description) {
    lines.push('', category.description);
  }

  lines.push('', `Total: ${category.tokens.length} tokens`, '');
  lines.push('| Token | Value | Utility |');
  lines.push('|-------|-------|---------|');
  for (const token of category.tokens) {
    const utility = tokenUtilities(token.name)
      .map(u => `\`${u}\``)
      .join(' ');
    lines.push(`| \`${token.name}\` | \`${token.value}\` | ${utility} |`);
  }

  return lines.join('\n');
}
