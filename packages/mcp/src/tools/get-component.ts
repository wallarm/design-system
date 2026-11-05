import type {
  ComponentMetadata,
  DesignSystemMetadata,
  ExampleMetadata,
  PropMetadata,
  SubComponentMetadata,
} from '@wallarm-org/mcp-core';
import { formatPropsTable, oneLine, paginate } from './format';

export function getComponent(
  metadata: DesignSystemMetadata,
  name: string,
): ComponentMetadata | undefined {
  return metadata.components.find(c => c.name.toLowerCase() === name.toLowerCase());
}

/** The component that exports `name` as a sub-component (case-insensitive). */
export function findSubComponentOwner(
  metadata: DesignSystemMetadata,
  name: string,
): { component: ComponentMetadata; sub: SubComponentMetadata } | undefined {
  const n = name.toLowerCase();
  for (const component of metadata.components) {
    const sub = component.subComponents.find(s => s.name.toLowerCase() === n);
    if (sub) return { component, sub };
  }
  return undefined;
}

const storyName = (example: ExampleMetadata) => example.storyTitle?.split('/').at(-1) ?? 'Story';

/** Example keys for `get_example`: the story name, qualified with the story file when ambiguous. */
export function exampleEntries(
  component: ComponentMetadata,
): { key: string; example: ExampleMetadata }[] {
  const counts = new Map<string, number>();
  for (const e of component.examples) counts.set(e.name, (counts.get(e.name) ?? 0) + 1);
  return component.examples.map(example => ({
    key:
      (counts.get(example.name) ?? 0) > 1 ? `${storyName(example)}/${example.name}` : example.name,
    example,
  }));
}

/**
 * Props most sub-components share (forwarded HTML attributes such as `id`, `title`, `tabIndex`).
 * Required or documented props are never treated as shared noise.
 */
function sharedProps(subs: SubComponentMetadata[]): Set<string> {
  const counts = new Map<string, number>();
  for (const sub of subs)
    for (const p of sub.props)
      if (!p.required && !p.description) counts.set(p.name, (counts.get(p.name) ?? 0) + 1);
  const min = Math.max(3, Math.ceil(subs.length / 2));
  return new Set([...counts].filter(([, n]) => n >= min).map(([name]) => name));
}

const withoutShared = (props: PropMetadata[], shared: Set<string>) =>
  props.filter(p => p.required || p.description || !shared.has(p.name));

const sharedNote = (shared: Set<string>) =>
  shared.size > 0
    ? `_Not repeated per sub-component — most also accept: ${[...shared].map(n => `\`${n}\``).join(', ')}._`
    : '';

/** Inline-code tool arguments, e.g. `{ name: 'Table', page: 2 }`. */
export const call = (args: Record<string, string | number>) =>
  `\`{ ${Object.entries(args)
    .map(([k, v]) => `${k}: ${typeof v === 'number' ? v : `'${v}'`}`)
    .join(', ')} }\``;

const formatVariantList = (c: ComponentMetadata) =>
  c.variants
    .map(v => {
      const def = v.defaultValue ? ` (default: \`${v.defaultValue}\`)` : '';
      const options =
        v.options.length > 0
          ? v.options.map(o => `\`${o}\``).join(', ')
          : '_dynamically generated_';
      return `- **${v.name}**: ${options}${def}`;
    })
    .join('\n');

function formatOverview(c: ComponentMetadata): string {
  const lines = [`# ${c.name}`];
  if (c.description) lines.push('', c.description);
  // A folder without a root component (SimpleCharts, CodeSnippet) exports only its parts.
  const exported =
    c.props.length === 0 && c.subComponents.length > 0
      ? `${c.subComponents
          .slice(0, 4)
          .map(x => x.name)
          .join(', ')}${c.subComponents.length > 4 ? ', …' : ''}`
      : c.name;
  lines.push('', `**Import:** \`import { ${exported} } from '${c.importPath}'\``);

  if (c.props.length > 0)
    lines.push('', '## Props', '', formatPropsTable(c.props, { brief: true }));

  if (c.variants.length > 0) lines.push('', '## Variants', '', formatVariantList(c));

  if (c.subComponents.length > 0) {
    lines.push('', `## Sub-components (${c.subComponents.length})`, '');
    if (c.subComponents.some(s => s.description)) {
      for (const s of c.subComponents)
        lines.push(`- **${s.name}**${s.description ? ` — ${oneLine(s.description)}` : ''}`);
    } else {
      lines.push(c.subComponents.map(s => s.name).join(', '));
    }
    lines.push(
      '',
      `Props of one: \`get_component\` ${call({ name: c.name, section: c.subComponents[0]?.name ?? '' })}; all: section \`'subcomponents'\`.`,
    );
  }

  const entries = exampleEntries(c);
  if (entries.length > 0) {
    lines.push('', `## Examples (${entries.length})`, '');
    for (const { key, example } of entries)
      lines.push(
        `- \`${key}\`${example.description ? ` — ${oneLine(example.description, 120)}` : ''}`,
      );
    lines.push(
      '',
      `Code: \`get_example\` ${call({ component: c.name, example: entries[0]?.key ?? '' })}; all code: section \`'examples'\`.`,
    );
  }

  if (c.docs && c.docs.length > 0) {
    lines.push('', '## Usage docs', '');
    for (const d of c.docs)
      lines.push(`- \`docs/${d.name}\` (${Math.round(d.markdown.length / 1000)}k chars)`);
    lines.push(
      '',
      `Read: \`get_component\` ${call({ name: c.name, section: `docs/${c.docs[0]?.name}` })}.`,
    );
  }

  return lines.join('\n');
}

function formatSubComponent(c: ComponentMetadata, sub: SubComponentMetadata): string {
  const shared = sharedProps(c.subComponents);
  const lines = [`# ${c.name} › ${sub.name}`];
  if (sub.description) lines.push('', sub.description);
  lines.push('', `**Import:** \`import { ${sub.name} } from '${c.importPath}'\``);
  const props = withoutShared(sub.props, shared);
  lines.push('', props.length > 0 ? formatPropsTable(props) : '_No own props._');
  const note = sharedNote(shared);
  if (note) lines.push('', note);
  const usedIn = exampleEntries(c)
    .filter(({ example }) => new RegExp(`<${sub.name}\\b`).test(example.code))
    .map(({ key }) => `\`${key}\``);
  if (usedIn.length > 0)
    lines.push(
      '',
      `Used in examples (\`get_example\`): ${usedIn.slice(0, 10).join(', ')}${usedIn.length > 10 ? ', …' : ''}`,
    );
  return lines.join('\n');
}

function formatSubComponents(c: ComponentMetadata): string {
  const shared = sharedProps(c.subComponents);
  const lines = [`# ${c.name} — sub-components`];
  const note = sharedNote(shared);
  if (note) lines.push('', note);
  for (const sub of c.subComponents) {
    const props = withoutShared(sub.props, shared);
    lines.push('', `### ${sub.name}`);
    if (sub.description) lines.push('', sub.description);
    lines.push('', props.length > 0 ? formatPropsTable(props) : '_No own props._');
  }
  return lines.join('\n');
}

export const formatExample = (key: string, example: ExampleMetadata) =>
  [
    `### ${key}`,
    ...(example.description ? ['', example.description] : []),
    '',
    '```tsx',
    example.code,
    '```',
  ].join('\n');

function formatExamples(c: ComponentMetadata): string {
  return [
    `# ${c.name} — examples`,
    ...exampleEntries(c).map(({ key, example }) => `\n${formatExample(key, example)}`),
  ].join('\n');
}

function formatProps(c: ComponentMetadata): string {
  return [
    `# ${c.name} — props`,
    '',
    c.props.length > 0 ? formatPropsTable(c.props) : '_No props._',
    ...(c.variants.length > 0 ? ['', '## Variants', '', formatVariantList(c)] : []),
  ].join('\n');
}

export function componentSections(c: ComponentMetadata): string[] {
  return [
    'props',
    ...(c.subComponents.length > 0 ? ['subcomponents'] : []),
    ...(c.examples.length > 0 ? ['examples'] : []),
    ...(c.docs ?? []).map(d => `docs/${d.name}`),
    ...c.subComponents.map(s => s.name),
  ];
}

export interface FormatComponentOptions {
  section?: string;
  page?: number;
  /** Appended to the overview, e.g. related guidelines. */
  related?: string;
  /** Last line of every response: where the metadata came from. */
  source?: string;
}

/**
 * `get_component` text: a compact overview by default, or one section in full
 * (`props`, `subcomponents`, `examples`, `docs/<Name>`, or a sub-component name), paginated.
 */
export function formatComponent(
  c: ComponentMetadata,
  options: FormatComponentOptions = {},
): string {
  const { section, page = 1, related = '', source } = options;
  const s = section?.trim().toLowerCase();
  let body: string | undefined;

  if (!s || s === 'overview') body = formatOverview(c) + related;
  else if (s === 'props' || s === 'variants') body = formatProps(c);
  else if (s === 'subcomponents' || s === 'sub-components') body = formatSubComponents(c);
  else if (s === 'examples') body = formatExamples(c);
  else if (s.startsWith('docs/')) {
    const doc = c.docs?.find(d => d.name.toLowerCase() === s.slice(5));
    if (doc) body = doc.markdown;
  } else {
    const sub = c.subComponents.find(x => x.name.toLowerCase() === s);
    if (sub) body = formatSubComponent(c, sub);
  }

  if (body === undefined) {
    return `Section "${section}" not found in ${c.name}.\n\nAvailable sections: ${componentSections(c).join(', ')}`;
  }

  const text = paginate(body, page, next =>
    call({ name: c.name, ...(section && { section }), page: next }),
  );
  const footer = s
    ? ''
    : `\n\n---\nMore: \`get_component\` with section ${componentSections(c)
        .slice(0, 4)
        .map(x => `\`'${x}'\``)
        .join(', ')}${c.subComponents.length > 0 ? ' or a sub-component name' : ''}.`;
  return `${text}${footer}${source ? `\n\n_${source}_` : ''}`;
}
