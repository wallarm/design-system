import fs from 'fs';
import path from 'path';

import type {
  Guideline,
  GuidelineKind,
  GuidelineSection,
  GuidelineStory,
  GuidelinesMetadata,
} from '@wallarm-org/mcp-core';

import { INTERNAL_COMPONENTS, type PublicApi } from './internal.js';
import { parsePatternStories, patternStoryImports } from './parse-examples.js';

const PKG = '@wallarm-org/design-system';

const RULES_MAX_CHARS = 2000;
const DESCRIPTION_MAX_CHARS = 200;

const KIND_DIRS: Record<string, GuidelineKind> = {
  foundations: 'foundation',
  patterns: 'pattern',
  templates: 'template',
};

const REQUIRED_SECTIONS: Record<GuidelineKind, string[]> = {
  foundation: ['What you use', 'Rules', 'Examples', 'Reference'],
  pattern: ['When to use', 'Rules', 'Examples', 'States', 'What your app owns', 'Related'],
  // A template is one complete screen; its rules live in the patterns it composes.
  template: ['What it shows', 'Examples', 'Related'],
};

/** Storybook title prefix of the sibling `.stories.tsx` (foundations have none). */
const STORY_TITLE: Partial<Record<GuidelineKind, string>> = {
  pattern: 'Patterns',
  template: 'Templates',
};

/** A story reference: a ```story fence holding one export name of the sibling `.stories.tsx`. */
const STORY_REF = /^```story[ \t]*\r?\n[ \t]*(\S+)[ \t]*\r?\n```[ \t]*$/gm;

// Longer than any backtick run in the code, so the code can't close the fence.
const fence = (code: string, info: string) => {
  const longest = Math.max(0, ...[...code.matchAll(/`+/g)].map(m => m[0].length));
  const ticks = '`'.repeat(Math.max(3, longest + 1));
  return `${ticks}${info}\n${code}\n${ticks}`;
};

/**
 * Replace every ```story ref with the story's description and its code as a
 * ```tsx story=<Name> fence (the docs site turns those into live previews).
 * Unknown names stay as written.
 */
export const resolveStoryRefs = (markdown: string, stories: GuidelineStory[]) =>
  markdown.replace(STORY_REF, (ref, name: string) => {
    const story = stories.find(s => s.name === name);
    if (!story) return ref;
    const code = fence(story.code, `tsx story=${name}`);
    return story.description ? `${story.description}\n\n${code}` : code;
  });

/** Pattern and template examples are story refs: no tsx fences, at least two, every story used once. */
const checkStoryRefs = (
  body: string,
  sections: GuidelineSection[],
  stories: GuidelineStory[],
  storiesFile: string,
  fail: (message: string) => void,
) => {
  const examples = sections.find(s => s.heading === 'Examples')?.markdown ?? '';
  if (/^\s*(```|~~~)/m.test(examples.replace(STORY_REF, ''))) {
    fail(
      '"## Examples" may hold only ```story refs and their captions; move the code into a story',
    );
  }
  const exampleRefs = [...examples.matchAll(STORY_REF)].length;
  if (exampleRefs < 2) fail(`"## Examples" has ${exampleRefs} \`\`\`story refs (min 2)`);

  const refs = [...body.matchAll(STORY_REF)].map(m => m[1] ?? '');
  const names = stories.map(s => s.name);
  for (const ref of refs) {
    if (!names.includes(ref)) {
      fail(`unknown story "${ref}" (exports of ${storiesFile}: ${names.join(', ') || 'none'})`);
    }
  }
  for (const name of names) {
    const count = refs.filter(ref => ref === name).length;
    if (count !== 1) {
      fail(`story "${name}" of ${storiesFile} is referenced ${count} times (exactly 1 expected)`);
    }
  }
};

const FENCE = /^\s*(```|~~~)([^\n]*)\n([\s\S]*?)^\s*\1[ \t]*$/gm;

/**
 * Guidelines never show internal components: not in a tsx fence (imports or JSX tags),
 * not as a backticked name in prose. The fix is to use or name the public API instead.
 */
export const findInternalUsage = (markdown: string, internal: Set<string>): string[] => {
  const problems = new Set<string>();
  for (const [, , info = '', code = ''] of markdown.matchAll(FENCE)) {
    if (!/^(tsx|jsx)\b/.test(info.trim())) continue;
    for (const [, names = '', spec = ''] of code.matchAll(
      /^\s*import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/gm,
    )) {
      const dir = spec.startsWith(`${PKG}/`) ? spec.slice(PKG.length + 1) : undefined;
      if (dir && INTERNAL_COMPONENTS.has(dir)) {
        problems.add(`tsx example imports internal "${spec}"`);
      }
      for (const name of names.match(/[A-Za-z_$][\w$]*/g) ?? []) {
        if (internal.has(name)) problems.add(`tsx example imports internal "${name}"`);
      }
    }
    for (const [, tag = ''] of code.matchAll(/<([A-Z][\w$]*)/g)) {
      if (internal.has(tag)) problems.add(`tsx example renders internal <${tag}>`);
    }
  }
  const prose = markdown.replace(FENCE, '');
  for (const [, span = ''] of prose.matchAll(/`([^`\n]+)`/g)) {
    for (const name of span.match(/[A-Za-z_$][\w$]*/g) ?? []) {
      if (internal.has(name)) {
        problems.add(`prose names internal \`${name}\` (not exported to consumers); rephrase`);
      }
    }
  }
  return [...problems];
};

/**
 * Pattern stories show only public API: imports from `../../components/<Dir>` (its index, a
 * public dir, names that index exports) or `../../icons`, and the extracted code MCP serves
 * imports only `@wallarm-org/design-system`, `/<PublicDir>` or `/icons`.
 */
export const findPrivateStoryImports = (
  storiesPath: string,
  srcDir: string,
  stories: GuidelineStory[],
  api: PublicApi,
): string[] => {
  const problems: string[] = [];
  for (const { spec, names } of patternStoryImports(storiesPath)) {
    if (!spec.startsWith('.')) continue;
    const rel = path
      .relative(srcDir, path.resolve(path.dirname(storiesPath), spec))
      .split(path.sep)
      .join('/');
    const [root, dir, ...rest] = rel.split('/');
    if (root !== 'components' || !dir) continue;
    if (INTERNAL_COMPONENTS.has(dir)) {
      problems.push(`imports internal component "${spec}" (not exported to consumers)`);
      continue;
    }
    if (rest.length > 0 && rest.join('/') !== 'index') {
      problems.push(`deep import "${spec}"; import from "../../components/${dir}" instead`);
      continue;
    }
    const exported = api.dirs.get(dir);
    for (const name of names) {
      if (!exported?.has(name)) {
        problems.push(
          `imports "${name}" from "${spec}", which components/${dir}/index.ts does not export`,
        );
      }
    }
  }
  for (const story of stories) {
    for (const [, spec = ''] of story.code.matchAll(/^import\s[\s\S]*?\sfrom\s+'([^']+)';/gm)) {
      const sub = spec.startsWith(`${PKG}/`) ? spec.slice(PKG.length + 1) : undefined;
      const ok = spec.startsWith('.')
        ? false
        : !spec.startsWith(PKG) || spec === PKG || sub === 'icons' || (!!sub && api.dirs.has(sub));
      if (!ok) problems.push(`story "${story.name}" extracts as a non-public import "${spec}"`);
    }
  }
  return problems;
};

/** Max prose words per guideline body (code fences excluded). */
const WORD_BUDGET: Record<GuidelineKind, number> = {
  foundation: 700,
  pattern: 1000,
  template: 400,
};

/** Words in a markdown body, not counting fenced code blocks. */
export const countProseWords = (body: string) =>
  body.replace(/^\s*(```|~~~)[\s\S]*?^\s*\1.*$/gm, '').match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu)
    ?.length ?? 0;

type FrontmatterValue = string | number | string[];

const unquote = (value: string) => value.replace(/^(['"])(.*)\1$/, '$2');

/**
 * Parse the flat frontmatter schema guidelines use: `key: scalar` and
 * `key: [a, b]` lines only — no nesting, no multi-line values.
 * ponytail: hand-rolled for this flat schema; swap in a YAML lib if guidelines ever need nesting.
 */
export const parseFrontmatter = (
  source: string,
): { data: Record<string, FrontmatterValue>; body: string } | undefined => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match?.[1]) return undefined;

  const data: Record<string, FrontmatterValue> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const [, key, rawValue = ''] = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/) ?? [];
    if (!key) continue;
    // Drop a trailing ` # comment` from unquoted values.
    const value = /^['"]/.test(rawValue)
      ? rawValue.trim()
      : rawValue.replace(/\s+#\s.*$/, '').trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map(item => unquote(item.trim()))
        .filter(Boolean);
    } else if (/^-?\d+(\.\d+)?$/.test(value)) {
      data[key] = Number(value);
    } else {
      data[key] = unquote(value);
    }
  }

  return { data, body: source.slice(match[0].length) };
};

export const toSectionId = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Split a markdown body into its H1 and H2 sections, ignoring headings inside code fences. */
export const splitSections = (
  body: string,
): { h1: string | undefined; sections: GuidelineSection[] } => {
  let h1: string | undefined;
  const sections: GuidelineSection[] = [];
  let current: { heading: string; lines: string[] } | undefined;
  let inFence = false;

  const flush = () => {
    if (!current) return;
    sections.push({
      id: toSectionId(current.heading),
      heading: current.heading,
      markdown: current.lines.join('\n').trim(),
    });
  };

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence) {
      const h1Match = line.match(/^#\s+(.+?)\s*$/);
      if (h1Match && h1 === undefined) {
        h1 = h1Match[1];
        continue;
      }
      const heading = line.match(/^##\s+(.+?)\s*$/)?.[1];
      if (heading) {
        flush();
        current = { heading, lines: [] };
        continue;
      }
    }
    current?.lines.push(line);
  }
  flush();

  return { h1, sections };
};

/** Relative `.md` link targets (`[x](../foundations/spacing.md#rules)`), external links skipped. */
const findBrokenLinks = (markdown: string, fileDir: string) =>
  [...markdown.matchAll(/\]\(([^)\s]+)\)/g)]
    .map(m => m[1] ?? '')
    .filter(target => !/^[a-z]+:/i.test(target) && !target.startsWith('#'))
    .map(target => target.split('#')[0] ?? '')
    .filter(target => !fs.existsSync(path.resolve(fileDir, target)));

const parseGuidelineFile = (
  filePath: string,
  slug: string,
  kind: GuidelineKind,
  api: PublicApi,
  errors: string[],
): Guideline | undefined => {
  const fail = (message: string) => errors.push(`${slug}.md: ${message}`);
  const parsed = parseFrontmatter(fs.readFileSync(filePath, 'utf-8'));
  if (!parsed) {
    fail('missing YAML frontmatter (--- ... ---) at the top of the file');
    return undefined;
  }

  const { data, body } = parsed;
  const { title, description, components, keywords, order } = data;

  if (typeof title !== 'string' || !title) fail('frontmatter "title" must be a non-empty string');
  if (typeof description !== 'string' || !description) {
    fail('frontmatter "description" must be a non-empty string');
  } else if (description.length > DESCRIPTION_MAX_CHARS) {
    fail(`frontmatter "description" is ${description.length} chars (max ${DESCRIPTION_MAX_CHARS})`);
  }
  if (!Array.isArray(components)) {
    fail('frontmatter "components" must be a list, e.g. [Stack, Flex] or []');
  }
  if (!Array.isArray(keywords)) fail('frontmatter "keywords" must be a list, e.g. [gap, padding]');
  if (typeof order !== 'number') fail('frontmatter "order" must be a number');

  for (const name of Array.isArray(components) ? components : []) {
    if (api.internal.has(name)) {
      fail(`internal component "${name}" in "components" (not exported to consumers)`);
    } else if (!api.names.has(name)) {
      fail(
        `unknown component "${name}" in "components" (not exported from @wallarm-org/design-system)`,
      );
    }
  }

  const { h1, sections } = splitSections(body);
  if (typeof title === 'string' && h1 !== title) {
    fail(`H1 must equal the title "${title}" (found ${h1 === undefined ? 'none' : `"${h1}"`})`);
  }
  const headings = new Set(sections.map(s => s.heading));
  for (const required of REQUIRED_SECTIONS[kind]) {
    if (!headings.has(required)) fail(`missing required section "## ${required}"`);
  }

  const words = countProseWords(body);
  if (words > WORD_BUDGET[kind]) fail(`${words} words, budget ${WORD_BUDGET[kind]}`);

  for (const target of findBrokenLinks(body, path.dirname(filePath))) {
    fail(`broken relative link "${target}"`);
  }

  for (const problem of findInternalUsage(body, api.internal)) fail(problem);

  const storyTitle = STORY_TITLE[kind];
  const stories = storyTitle
    ? parseStories(filePath, `${storyTitle}/${title}`, fail, api, message =>
        errors.push(`${slug}.stories.tsx: ${message}`),
      )
    : undefined;
  if (storyTitle) {
    const storiesFile = path.basename(filePath).replace(/\.md$/, '.stories.tsx');
    checkStoryRefs(body, sections, stories ?? [], storiesFile, fail);
  }
  const markdown = resolveStoryRefs(body, stories ?? []).trim();

  if (
    typeof title !== 'string' ||
    typeof description !== 'string' ||
    !Array.isArray(components) ||
    !Array.isArray(keywords) ||
    typeof order !== 'number'
  ) {
    return undefined;
  }

  return {
    slug,
    kind,
    title,
    description,
    components,
    keywords,
    order,
    markdown,
    sections: splitSections(markdown).sections,
    ...(stories?.length ? { stories } : {}),
  };
};

/**
 * `<patterns|templates>/<slug>.stories.tsx` next to the guideline: its exported stories in file
 * order. Optional here; the docs site requires one per pattern and template (apps/website check-build).
 */
const parseStories = (
  filePath: string,
  expected: string,
  fail: (message: string) => void,
  api: PublicApi,
  failStories: (message: string) => void,
): GuidelineStory[] | undefined => {
  const storiesPath = filePath.replace(/\.md$/, '.stories.tsx');
  if (!fs.existsSync(storiesPath)) return undefined;
  // src/guidelines/<kind>/x.stories.tsx → src/
  const srcDir = path.resolve(path.dirname(storiesPath), '../..');
  const examples = parsePatternStories(storiesPath, srcDir);
  const found = examples[0]?.storyTitle;
  if (examples.length === 0) fail(`${path.basename(storiesPath)} exports no stories`);
  else if (found !== expected) {
    fail(`${path.basename(storiesPath)} meta title must be "${expected}" (found "${found}")`);
  }
  const stories = examples.map(({ name, code, description }) => ({
    name,
    code,
    ...(description && { description }),
  }));
  for (const problem of findPrivateStoryImports(storiesPath, srcDir, stories, api)) {
    failStories(problem);
  }
  return stories;
};

/**
 * Read and validate `src/guidelines/` (rules.md + foundations/*.md + patterns/*.md + templates/*.md).
 * Throws one Error listing every problem so the build fails with all of them at once.
 */
export const parseGuidelines = ({
  dir,
  version,
  api,
}: {
  dir: string;
  version: string;
  /** Public API and internal names (`collectPublicApi`). */
  api: PublicApi;
}): GuidelinesMetadata => {
  const errors: string[] = [];

  const rulesPath = path.join(dir, 'rules.md');
  const rules = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, 'utf-8') : '';
  if (!rules) errors.push('rules.md: missing or empty');
  if (rules.length > RULES_MAX_CHARS) {
    errors.push(`rules.md: ${rules.length} chars (max ${RULES_MAX_CHARS})`);
  }
  if (rules.startsWith('---')) errors.push('rules.md: must not have frontmatter');
  for (const problem of findInternalUsage(rules, api.internal)) {
    errors.push(`rules.md: ${problem}`);
  }
  for (const target of findBrokenLinks(rules, dir)) {
    errors.push(`rules.md: broken relative link "${target}"`);
  }

  const guidelines: Guideline[] = [];
  for (const [subdir, kind] of Object.entries(KIND_DIRS)) {
    const kindDir = path.join(dir, subdir);
    if (!fs.existsSync(kindDir)) continue;
    for (const file of fs
      .readdirSync(kindDir)
      .filter(f => f.endsWith('.md'))
      .sort()) {
      const slug = `${subdir}/${file.slice(0, -'.md'.length)}`;
      const guideline = parseGuidelineFile(path.join(kindDir, file), slug, kind, api, errors);
      if (guideline) guidelines.push(guideline);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid guidelines:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }

  guidelines.sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.order - b.order || a.slug.localeCompare(b.slug),
  );

  return { version, rules, guidelines };
};
