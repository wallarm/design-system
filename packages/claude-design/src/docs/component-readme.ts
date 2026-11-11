import type { ComponentMetadata, PropMetadata } from '@wallarm-org/mcp-core';

const kebab = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const tableText = (value: string): string => value.replaceAll('|', '\\|').replace(/\s+/g, ' ');

const normalizedType = (
  prop: PropMetadata,
  component: Pick<ComponentMetadata, 'variants'>,
): string => {
  const variant = component.variants.find(item => item.name === prop.name);
  const cvaOptions = /^\{[\s\S]*\}$/.test(prop.type.trim())
    ? [...prop.type.matchAll(/(?:^\{|;)\s*(['"]?[\w-]+['"]?)\s*:\s*string/g)].map(
        match => match[1]?.replace(/^['"]|['"]$/g, '') ?? '',
      )
    : [];
  const options = variant?.options.length ? variant.options : cvaOptions;
  if (options.length && options.every(option => option === 'true' || option === 'false')) {
    return 'boolean';
  }
  return options.length ? options.map(option => JSON.stringify(option)).join(' | ') : prop.type;
};

/** The props table and sub-components of one guide. */
export const componentReadme = (
  component: Pick<ComponentMetadata, 'name' | 'props' | 'variants' | 'subComponents'>,
  defaults: Record<string, Record<string, string>>,
): string => {
  const lines = [
    '## Props as canvas attributes',
    '',
    'Use kebab-case attribute names. Pass non-string values through renderVals holes, including booleans. The full emitted API is in `components/index.d.ts`.',
    '',
    '| Attribute | Type | Required | Default | Description |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const prop of component.props) {
    const defaultValue =
      defaults[component.name]?.[prop.name] ??
      prop.defaultValue ??
      component.variants.find(variant => variant.name === prop.name)?.defaultValue;
    lines.push(
      `| \`${kebab(prop.name)}\` | \`${tableText(normalizedType(prop, component))}\` | ${prop.required ? 'yes' : 'no'} | ${defaultValue === undefined ? '—' : `\`${tableText(defaultValue)}\``} | ${tableText(prop.description ?? '')} |`,
    );
  }
  if (!component.props.length) {
    lines.push('| — | See emitted declarations in `components/index.d.ts`. | | | |');
  }
  if (component.subComponents.length) {
    lines.push(
      '',
      '## Sub-components',
      '',
      ...component.subComponents.map(
        part => `- \`WallarmDS.${part.name}\` — \`${part.name}Props\` in the declaration bundle.`,
      ),
    );
  }
  return `${lines.join('\n')}\n`;
};
