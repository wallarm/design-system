import type {
  ComponentMetadata,
  ExampleMetadata,
  PropMetadata,
  TokenCategory,
} from '@wallarm-org/mcp-core';

const CATEGORY_ORDER = [
  'Actions',
  'Inputs',
  'Inputs Date',
  'Data Display',
  'Navigation',
  'Overlay',
  'Messaging',
  'Status Indication',
  'Layout',
  'Loading',
  'Typography',
  'Primitives',
  'Patterns',
  'Pages',
  'AI',
  'Brand',
];

const GITHUB_COMPONENTS =
  'https://github.com/wallarm/design-system/tree/main/packages/design-system/src/components';
const STORYBOOK = 'https://wallarm.github.io/design-system/storybook/?path=/docs';

export const toStoryId = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Inline code spans are literal in MDX, so they are left as written.
export const escapeMdx = (text: string): string =>
  text
    .split(/(`[^`]*`)/)
    .map((part, i) =>
      i % 2 ? part : part.replace(/[{}]/g, '\\$&').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    )
    .join('');

export const escapeCell = (text: string): string =>
  escapeMdx(text)
    .replace(/\|/g, '\\|')
    .replace(/\s*\n\s*/g, ' ')
    .trim();

const codeCell = (text: string): string =>
  `\`${text.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ')}\``;

export function renderPropsTable(props: PropMetadata[]): string {
  const rows = props.map(
    p =>
      `| ${p.name}${p.required ? ' *' : ''} | ${codeCell(p.type)} | ${p.defaultValue ? codeCell(p.defaultValue) : ''} | ${escapeCell(p.description ?? '')} |`,
  );
  return ['| Prop | Type | Default | Description |', '| --- | --- | --- | --- |', ...rows].join(
    '\n',
  );
}

const words = (name: string): string[] =>
  name.split(/(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/);

export const kebab = (name: string): string => words(name).join('-').toLowerCase();

// 'WithFooter' → 'With footer'; acronyms ('OTP') keep their case.
const humanize = (name: string): string =>
  words(name)
    .map((w, i) => (i === 0 || /^[A-Z0-9]+$/.test(w) ? w : w.toLowerCase()))
    .join(' ');

// Longer than any backtick run in the code, so the code can't close the fence.
const fence = (code: string, lang = 'tsx'): string => {
  const longest = Math.max(0, ...[...code.matchAll(/`+/g)].map(m => m[0].length));
  const ticks = '`'.repeat(Math.max(3, longest + 1));
  return `${ticks}${lang}\n${code}\n${ticks}`;
};

const loader = (base: string, storyFile: string | undefined): string =>
  `() => import('${base}/${storyFile}')`;

const storyPreview = (e: ExampleMetadata, base: string): string =>
  `<StoryPreview load={${loader(base, e.storyFile)}} name='${e.name}'>\n\n${fence(e.code)}\n\n</StoryPreview>`;

const exampleBlock = (e: ExampleMetadata, level: string, base: string): string =>
  [
    `${level} ${humanize(e.name)}`,
    e.description ? escapeMdx(e.description) : '',
    storyPreview(e, base),
  ]
    .filter(Boolean)
    .join('\n\n');

const lastSegment = (title: string | undefined): string => title?.split('/').at(-1) ?? '';

const category = (c: ComponentMetadata): string => c.examples[0]?.storyTitle?.split('/')[0] ?? '';

const usageImports = (c: ComponentMetadata, first: ExampleMetadata): string => {
  const imports = [...first.code.matchAll(/^import[\s\S]*?from '([^']+)';?$/gm)]
    .filter(m => m[1]?.startsWith('@wallarm-org/design-system'))
    .map(m => m[0]);
  return imports.length ? imports.join('\n') : `import { ${c.name} } from '${c.importPath}';`;
};

export function renderComponentPage(
  c: ComponentMetadata,
  opts: { storyImportBase: string; hasSubcomponents: boolean },
): string | null {
  const [first, ...rest] = c.examples;
  if (!first) return null;
  const base = opts.storyImportBase;
  const out: string[] = [];

  out.push(
    `---\ntitle: ${JSON.stringify(c.name)}\ndescription: ${JSON.stringify(c.description ?? '')}\n---`,
  );
  out.push(`# ${c.name}`);
  if (c.description) out.push(escapeMdx(c.description));
  out.push(
    `[Source](${GITHUB_COMPONENTS}/${c.name}) · [Storybook](${STORYBOOK}/${toStoryId(first.storyTitle ?? '')}--overview)`,
  );
  out.push(storyPreview(first, base));
  out.push('## Usage', fence(usageImports(c, first)));

  if (rest.length) {
    out.push('## Examples');
    const files = [...new Set(c.examples.map(e => e.storyFile))];
    if (files.length > 1) {
      for (const file of files) {
        const group = rest.filter(e => e.storyFile === file);
        if (!group.length) continue;
        out.push(`### ${lastSegment(group[0]?.storyTitle)}`);
        for (const e of group) out.push(exampleBlock(e, '####', base));
      }
    } else {
      for (const e of rest) out.push(exampleBlock(e, '###', base));
    }
  }

  // Empty tables are skipped; some roots (Dialog, Tabs, …) have no extracted props.
  const subs = c.subComponents.filter(sub => sub.props.length);
  if (c.props.length || subs.length) out.push('## Props');
  if (c.props.length) out.push(renderPropsTable(c.props));
  for (const sub of subs) out.push(`### ${sub.name}`, renderPropsTable(sub.props));

  if (opts.hasSubcomponents) {
    out.push(
      '## Explorer',
      `<Explorer load={${loader(base, first.storyFile)}} name='${first.name}' />`,
    );
  }

  return `${out.join('\n\n')}\n`;
}

const byCategory = (components: ComponentMetadata[]): [string, ComponentMetadata[]][] => {
  const groups = new Map<string, ComponentMetadata[]>();
  for (const c of components.filter(c => c.examples.length)) {
    const cat = category(c);
    groups.set(cat, [...(groups.get(cat) ?? []), c]);
  }
  const rank = (cat: string): number => {
    const i = CATEGORY_ORDER.indexOf(cat);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return [...groups]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([cat, list]) => [cat, list.sort((a, b) => a.name.localeCompare(b.name))]);
};

export function renderComponentsMeta(components: ComponentMetadata[]): string {
  const items: (string | { type: 'section-header'; label: string })[] = ['index'];
  for (const [cat, list] of byCategory(components)) {
    items.push({ type: 'section-header', label: cat }, ...list.map(c => kebab(c.name)));
  }
  return `${JSON.stringify(items, null, 2)}\n`;
}

const firstSentence = (text: string): string =>
  text.replace(/\s*\n\s*/g, ' ').split(/(?<=[.!?])\s/)[0] ?? '';

export function renderComponentsIndex(components: ComponentMetadata[]): string {
  const out = ['# Components'];
  for (const [cat, list] of byCategory(components)) {
    out.push(`## ${cat}`);
    out.push(
      list
        .map(c => {
          const desc = c.description ? ` — ${escapeMdx(firstSentence(c.description))}` : '';
          return `- [${c.name}](./${kebab(c.name)})${desc}`;
        })
        .join('\n'),
    );
  }
  return `${out.join('\n\n')}\n`;
}

export function renderTokensPage(tokens: TokenCategory[]): string {
  const out = ['# Tokens'];
  for (const cat of tokens) {
    out.push(`## ${cat.name}`);
    if (cat.name.includes('syntax')) out.push('Code-managed mapping — do not override.');
    const rows = cat.tokens.map(t => `| ${escapeCell(t.name)} | ${escapeCell(t.value)} |`);
    out.push(['| Token | Value |', '| --- | --- |', ...rows].join('\n'));
  }
  return `${out.join('\n\n')}\n`;
}

export const renderChangelogPage = (changelogMd: string): string =>
  `---\ntitle: "Changelog"\n---\n\n# Changelog\n\n${changelogMd}`;
