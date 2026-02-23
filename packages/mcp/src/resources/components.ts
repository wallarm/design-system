import type { DesignSystemMetadata } from '@wallarm-org/mcp-core';

export function getComponentListContent(metadata: DesignSystemMetadata): string {
  const lines = [
    `# Wallarm Design System Components (v${metadata.version})`,
    '',
    `Total: ${metadata.components.length} components`,
    '',
    '| Component | Import Path | Description |',
    '|-----------|-------------|-------------|',
  ];

  for (const c of metadata.components) {
    const desc = c.description ?? '-';
    lines.push(`| ${c.name} | \`${c.importPath}\` | ${desc} |`);
  }

  return lines.join('\n');
}
