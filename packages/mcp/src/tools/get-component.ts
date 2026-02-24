import type { ComponentMetadata, DesignSystemMetadata } from '@wallarm-org/mcp-core';

export function getComponent(
  metadata: DesignSystemMetadata,
  name: string,
): ComponentMetadata | undefined {
  return metadata.components.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export function formatComponentDetails(component: ComponentMetadata): string {
  const lines: string[] = [];

  lines.push(`# ${component.name}`);
  if (component.description) {
    lines.push('', component.description);
  }
  lines.push('', `**Import:** \`import { ${component.name} } from '${component.importPath}'\``);

  // Props
  if (component.props.length > 0) {
    lines.push('', '## Props', '');
    lines.push('| Prop | Type | Required | Default | Description |');
    lines.push('|------|------|----------|---------|-------------|');
    for (const prop of component.props) {
      const req = prop.required ? 'Yes' : 'No';
      const def = prop.defaultValue ?? '-';
      const desc = prop.description ?? '-';
      lines.push(`| \`${prop.name}\` | \`${prop.type}\` | ${req} | \`${def}\` | ${desc} |`);
    }
  }

  // Variants
  if (component.variants.length > 0) {
    lines.push('', '## Variants', '');
    for (const variant of component.variants) {
      const defaultNote = variant.defaultValue ? ` (default: \`${variant.defaultValue}\`)` : '';
      const options =
        variant.options.length > 0
          ? variant.options.map(o => `\`${o}\``).join(', ')
          : '_dynamically generated_';
      lines.push(`- **${variant.name}**: ${options}${defaultNote}`);
    }
  }

  // Sub-components
  if (component.subComponents.length > 0) {
    lines.push('', '## Sub-components', '');
    for (const sub of component.subComponents) {
      lines.push(`### ${sub.name}`);
      if (sub.props.length > 0) {
        lines.push('');
        lines.push('| Prop | Type | Required | Default | Description |');
        lines.push('|------|------|----------|---------|-------------|');
        for (const prop of sub.props) {
          const req = prop.required ? 'Yes' : 'No';
          const def = prop.defaultValue ?? '-';
          const desc = prop.description ?? '-';
          lines.push(`| \`${prop.name}\` | \`${prop.type}\` | ${req} | \`${def}\` | ${desc} |`);
        }
      }
      lines.push('');
    }
  }

  // Usage Examples
  if (component.examples && component.examples.length > 0) {
    lines.push('', '## Usage Examples', '');
    for (const example of component.examples) {
      lines.push(`### ${example.name}`);
      if (example.description) {
        lines.push('', example.description);
      }
      lines.push('', '```tsx', example.code, '```', '');
    }
  }

  return lines.join('\n');
}
