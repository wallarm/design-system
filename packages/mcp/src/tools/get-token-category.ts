import type { DesignSystemMetadata, TokenCategory } from '@wallarm-org/mcp-core';

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
  lines.push('| Token | Value |');
  lines.push('|-------|-------|');
  for (const token of category.tokens) {
    lines.push(`| \`${token.name}\` | \`${token.value}\` |`);
  }

  return lines.join('\n');
}
