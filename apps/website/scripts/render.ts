import type {
  ComponentMetadata,
  ExampleMetadata,
  Guideline,
  PropMetadata,
  TokenCategory,
} from '@wallarm-org/mcp-core';
import path from 'node:path';

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
  'Pages',
  'AI',
  'Brand',
];

const GITHUB_COMPONENTS =
  'https://github.com/wallarm/design-system/tree/main/packages/design-system/src/components';
const STORYBOOK_ROOT = 'https://wallarm.github.io/design-system/storybook/';
const STORYBOOK = `${STORYBOOK_ROOT}?path=/docs`;

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

/** `!autodocs` stories (heavy, document-scroll driven) are kept off docs pages: code + link only. */
const isLive = (e: ExampleMetadata): boolean => !e.tags?.includes('!autodocs');

const storyLink = (e: ExampleMetadata): string =>
  `[Open in Storybook](${STORYBOOK_ROOT}?path=/story/${toStoryId(e.storyTitle ?? '')}--${kebab(e.name)})`;

const exampleBlock = (e: ExampleMetadata, level: string, base: string): string =>
  [
    `${level} ${humanize(e.name)}`,
    e.description ? escapeMdx(e.description) : '',
    ...(isLive(e) ? [storyPreview(e, base)] : [fence(e.code), storyLink(e)]),
  ]
    .filter(Boolean)
    .join('\n\n');

const lastSegment = (title: string | undefined): string => title?.split('/').at(-1) ?? '';

const CATEGORY_LABELS: Record<string, string> = { AI: 'AI Assistant' };

const category = (c: ComponentMetadata): string => c.examples[0]?.storyTitle?.split('/')[0] ?? '';

const categoryLabel = (cat: string): string => CATEGORY_LABELS[cat] ?? cat;

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
  const [first] = c.examples;
  if (!first) return null;
  const lead = c.examples.find(isLive);
  const rest = c.examples.filter(e => e !== lead);
  const base = opts.storyImportBase;
  const out: string[] = [];

  out.push(
    `---\ntitle: ${JSON.stringify(c.name)}\ndescription: ${JSON.stringify(c.description || `${c.name}: live examples, usage and props for the ${c.name} component.`)}\n---`,
  );
  out.push(`# ${c.name}`);
  if (c.description) out.push(escapeMdx(c.description));
  out.push(
    `[Source](${GITHUB_COMPONENTS}/${c.name}) · [Storybook](${STORYBOOK}/${toStoryId(first.storyTitle ?? '')}--overview)`,
  );
  if (lead) out.push(storyPreview(lead, base));
  out.push('## Usage', fence(usageImports(c, lead ?? first)));

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

  if (opts.hasSubcomponents && lead) {
    out.push(
      '## Explorer',
      `<Explorer load={${loader(base, lead.storyFile)}} name='${lead.name}' />`,
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

export function renderComponentsMeta(
  components: ComponentMetadata[],
  opts: { newComponents: Set<string> },
): string {
  const groups = byCategory(components).map(([cat, list]) => ({
    type: 'custom-link',
    label: categoryLabel(cat),
    collapsible: true,
    collapsed: false,
    items: list.map(c => ({
      type: 'custom-link',
      label: c.name,
      link: `/components/${kebab(c.name)}`,
      ...(opts.newComponents.has(c.name) && { tag: 'new' }),
    })),
  }));
  return `${JSON.stringify(groups, null, 2)}\n`;
}

export const titleCase = (kebab: string): string =>
  kebab
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export function renderTokensPage(tokens: TokenCategory[]): string {
  const out = [
    '---\ntitle: "Tokens"\ndescription: "Wallarm design system tokens: color palettes, semantic light and dark colors, spacing, typography, radius, shadow, blur, focus and icon sizes, with their values."\n---',
    '# Tokens',
  ];
  for (const cat of tokens) {
    out.push(`## ${titleCase(cat.name)}`);
    if (cat.name.includes('syntax')) out.push('Code-managed mapping — do not override.');
    const rows = cat.tokens.map(t => `| ${escapeCell(t.name)} | ${escapeCell(t.value)} |`);
    const table = ['| Token | Value |', '| --- | --- |', ...rows].join('\n');
    // JSON is a valid JS expression; only the line separators need escaping.
    const json = JSON.stringify(cat.tokens.map(({ name, value }) => ({ name, value })))
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
    out.push(
      `<TokenTable category=${JSON.stringify(cat.name)} tokens={${json}}>\n\n${table}\n\n</TokenTable>`,
    );
  }
  return `${out.join('\n\n')}\n`;
}

export const renderChangelogPage = (changelogMd: string): string =>
  `---\ntitle: "Changelog"\ndescription: "Release notes for every @wallarm-org/design-system version."\n---\n\n# Changelog\n\n${changelogMd}`;

/** Maps a component name to its docs page; sub-components (`AvatarName`, `Toaster`) go to their owner's page. */
export function componentPageResolver(
  components: ComponentMetadata[],
): (name: string) => string | undefined {
  const pages = new Set(components.filter(c => c.examples.length).map(c => c.name));
  const owners = new Map(components.flatMap(c => c.subComponents.map(s => [s.name, c.name])));
  const byLength = [...pages].sort((a, b) => b.length - a.length);
  return name => {
    const owner = pages.has(name)
      ? name
      : (owners.get(name) ?? byLength.find(p => name.startsWith(p)));
    return owner && pages.has(owner) ? `/components/${kebab(owner)}` : undefined;
  };
}

const componentLinks = (names: string[], link: (name: string) => string | undefined): string =>
  names
    .map(n => {
      const href = link(n);
      return href ? `[\`${n}\`](${href})` : `\`${n}\``;
    })
    .join(', ');

/** `../foundations/spacing.md#rules` in guideline `patterns/x` → `/foundations/spacing#rules`. */
export const rewriteGuidelineLinks = (markdown: string, slug: string): string =>
  markdown.replace(
    /\]\((?![a-z]+:|\/|#)([^)\s#]+)\.md(#[^)\s]*)?\)/g,
    (_, target: string, hash = '') =>
      `](${path.posix.join('/', path.posix.dirname(slug), target)}${hash})`,
  );

/** escapeMdx for prose lines only; fenced code renders as code and is left as written. */
export const escapeMarkdown = (markdown: string): string => {
  let fence = '';
  return markdown
    .split('\n')
    .map(line => {
      const [, run = '', info = ''] = line.match(/^\s*(`{3,}|~{3,})\s*(\S*)/) ?? [];
      if (!fence) {
        fence = run;
        return fence ? line : escapeMdx(line);
      }
      // Closes on the same character, at least as long, with no info string.
      if (run[0] === fence[0] && run.length >= fence.length && !info) fence = '';
      return line;
    })
    .join('\n');
};

const byOrder = (guidelines: Guideline[]): Guideline[] =>
  [...guidelines].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

const pageName = (g: Guideline): string => g.slug.split('/').at(-1) ?? g.slug;

/** A story the guideline embeds: `tsx story=<Name>` fences (resolved ```story refs). */
const STORY_FENCE = /^(`{3,})tsx story=(\S+)\n([\s\S]*?)\n\1$/gm;

/** Each embedded story fence becomes a full-bleed live preview with its code. */
export const embedStories = (markdown: string, storyFile: string, base: string): string =>
  markdown.replace(
    STORY_FENCE,
    (_, _ticks: string, name: string, code: string) =>
      `<StoryPreview load={${loader(base, storyFile)}} name='${name}' fullscreen>\n\n${fence(code)}\n\n</StoryPreview>`,
  );

/**
 * `## Live example`: every story, for a pattern whose examples are not stories yet.
 * ponytail: transitional; delete with UNCONVERTED_PATTERNS in parse-guidelines.ts.
 */
function renderLiveExample(g: Guideline, storyImportBase: string): string {
  const stories = g.stories ?? [];
  if (!stories.length) return '';
  const file = `${pageName(g)}.stories.tsx`;
  const preview = (name: string, code: string) =>
    `<StoryPreview load={${loader(storyImportBase, file)}} name='${name}' fullscreen>\n\n${fence(code)}\n\n</StoryPreview>`;
  const storybook = `[Open in Storybook](${STORYBOOK_ROOT}?path=/story/${toStoryId(`Patterns/${g.title}`)}--${kebab(stories[0]?.name ?? '')})`;
  const blocks = stories.map((s, i) =>
    [
      i === 0 ? '' : `### ${humanize(s.name)}`,
      s.description ? escapeMdx(s.description) : '',
      preview(s.name, s.code),
    ]
      .filter(Boolean)
      .join('\n\n'),
  );
  return ['## Live example', storybook, ...blocks].join('\n\n');
}

export function renderGuidelinePage(
  g: Guideline,
  link: (name: string) => string | undefined,
  opts: { storyImportBase?: string } = {},
): string {
  const base = opts.storyImportBase;
  const escaped = escapeMarkdown(rewriteGuidelineLinks(g.markdown.trim(), g.slug));
  const body = base ? embedStories(escaped, `${pageName(g)}.stories.tsx`, base) : escaped;
  const components = g.components.length
    ? `**Components:** ${componentLinks(g.components, link)}`
    : '';
  const live = base && body === escaped ? renderLiveExample(g, base) : '';
  // The components line goes right under the H1, which the body always starts with; the live
  // example closes the intro, right before the first H2.
  const withLive = (md: string): string => {
    if (!live) return md;
    const at = md.search(/^## /m);
    return at === -1 ? `${md}\n\n${live}` : `${md.slice(0, at)}${live}\n\n${md.slice(at)}`;
  };
  const [h1, ...rest] = body.split('\n');
  const content = h1?.startsWith('# ')
    ? [h1, components, withLive(rest.join('\n').trim())]
    : [`# ${escapeMdx(g.title)}`, components, withLive(body)];
  return `---\ntitle: ${JSON.stringify(g.title)}\ndescription: ${JSON.stringify(g.description)}\n---\n\n${content.filter(Boolean).join('\n\n')}\n`;
}

/** Sidebar order: guideline pages by `order`, around the fixed pages of the section. */
export const renderGuidelinesMeta = (
  guidelines: Guideline[],
  opts: { before?: string[]; after?: string[] } = {},
): string =>
  `${JSON.stringify([...(opts.before ?? []), ...byOrder(guidelines).map(pageName), ...(opts.after ?? [])])}\n`;
