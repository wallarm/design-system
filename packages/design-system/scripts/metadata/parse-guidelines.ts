import fs from 'fs';
import path from 'path';
import type {
  Guideline,
  GuidelineKind,
  GuidelineSection,
  GuidelineStory,
  GuidelinesMetadata,
} from '@wallarm-org/mcp-core';
import { parsePatternStories } from './parse-examples.js';

const RULES_MAX_CHARS = 2000;
const DESCRIPTION_MAX_CHARS = 200;

const KIND_DIRS: Record<string, GuidelineKind> = {
  foundations: 'foundation',
  patterns: 'pattern',
};

const REQUIRED_SECTIONS: Record<GuidelineKind, string[]> = {
  foundation: ['What you use', 'Rules', 'Examples', 'Reference'],
  pattern: ['When to use', 'Rules', 'Examples', 'States', 'What your app owns', 'Related'],
};

/** Max prose words per guideline body (code fences excluded). */
const WORD_BUDGET: Record<GuidelineKind, number> = { foundation: 700, pattern: 1000 };

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
  knownComponents: Set<string>,
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
  if (!Array.isArray(components))
    fail('frontmatter "components" must be a list, e.g. [Stack, Flex] or []');
  if (!Array.isArray(keywords)) fail('frontmatter "keywords" must be a list, e.g. [gap, padding]');
  if (typeof order !== 'number') fail('frontmatter "order" must be a number');

  for (const name of Array.isArray(components) ? components : []) {
    if (!knownComponents.has(name)) {
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

  const stories = kind === 'pattern' ? parseStories(filePath, title, fail) : undefined;

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
    markdown: body.trim(),
    sections,
    ...(stories?.length ? { stories } : {}),
  };
};

/**
 * `patterns/<slug>.stories.tsx` next to the guideline: its exported stories in file order.
 * Optional here; the docs site requires one per pattern (apps/website check-build).
 */
const parseStories = (
  filePath: string,
  title: FrontmatterValue | undefined,
  fail: (message: string) => void,
): GuidelineStory[] | undefined => {
  const storiesPath = filePath.replace(/\.md$/, '.stories.tsx');
  if (!fs.existsSync(storiesPath)) return undefined;
  // src/guidelines/patterns/x.stories.tsx → src/
  const srcDir = path.resolve(path.dirname(storiesPath), '../..');
  const examples = parsePatternStories(storiesPath, srcDir);
  const expected = `Patterns/${title}`;
  const found = examples[0]?.storyTitle;
  if (examples.length === 0) fail(`${path.basename(storiesPath)} exports no stories`);
  else if (found !== expected) {
    fail(`${path.basename(storiesPath)} meta title must be "${expected}" (found "${found}")`);
  }
  return examples.map(({ name, code, description }) => ({
    name,
    code,
    ...(description && { description }),
  }));
};

/**
 * Read and validate `src/guidelines/` (rules.md + foundations/*.md + patterns/*.md).
 * Throws one Error listing every problem so the build fails with all of them at once.
 */
export const parseGuidelines = ({
  dir,
  version,
  knownComponents,
}: {
  dir: string;
  version: string;
  knownComponents: Set<string>;
}): GuidelinesMetadata => {
  const errors: string[] = [];

  const rulesPath = path.join(dir, 'rules.md');
  const rules = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, 'utf-8') : '';
  if (!rules) errors.push('rules.md: missing or empty');
  if (rules.length > RULES_MAX_CHARS) {
    errors.push(`rules.md: ${rules.length} chars (max ${RULES_MAX_CHARS})`);
  }
  if (rules.startsWith('---')) errors.push('rules.md: must not have frontmatter');
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
      const guideline = parseGuidelineFile(
        path.join(kindDir, file),
        slug,
        kind,
        knownComponents,
        errors,
      );
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
