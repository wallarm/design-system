import type { DesignSystemMetadata } from '@wallarm-org/mcp-core';

export function getTokensContent(metadata: DesignSystemMetadata): string {
  const lines = [`# Wallarm Design System Tokens (v${metadata.version})`, ''];

  for (const category of metadata.tokens) {
    lines.push(`## ${category.name}`);
    if (category.description) {
      lines.push('', category.description);
    }
    lines.push('');
    lines.push('| Token | Value |');
    lines.push('|-------|-------|');
    for (const token of category.tokens) {
      lines.push(`| \`${token.name}\` | \`${token.value}\` |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
