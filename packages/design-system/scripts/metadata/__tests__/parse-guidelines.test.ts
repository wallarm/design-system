import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import { afterEach, describe, expect, it } from '@rstest/core';
import { guidelinesMetadataSchema } from '@wallarm-org/mcp-core';
import { Project } from 'ts-morph';

import { collectPublicApi, type PublicApi } from '../internal.js';
import {
  countProseWords,
  findInternalUsage,
  findPrivateStoryImports,
  parseFrontmatter,
  parseGuidelines,
  splitSections,
  toSectionId,
} from '../parse-guidelines.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDELINES_DIR = path.resolve(__dirname, '../../../src/guidelines');

const FOUNDATION = `---
title: Spacing
description: Use when spacing things.
components: [Stack]
keywords: [gap]
order: 10
---

# Spacing

## What you use

Stack.

## Rules

- Use gap. See [Empty](../patterns/empty.md#rules).

## Examples

Rows of fields use a gap.

\`\`\`tsx
<Stack gap={12} />
\`\`\`

## Reference

Tokens.
`;

const tmpDirs: string[] = [];

const makeDir = (files: Record<string, string>) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'guidelines-'));
  tmpDirs.push(dir);
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  }
  return dir;
};

const PATTERN = `---
title: Empty
description: Use when empty.
components: []
keywords: []
order: 1
---

# Empty

## When to use

Text.

## Rules

Text.

## Examples

The main case.

\`\`\`story
Default
\`\`\`

Search matched nothing.

\`\`\`story
NoResults
\`\`\`

${['States', 'What your app owns', 'Related'].map(h => `## ${h}\n\nText.`).join('\n\n')}
`;

const STORIES = `const meta = { title: 'Patterns/Empty' };
export default meta;

/** Nothing exists yet. */
export const Default = () => <p>Empty</p>;
export const NoResults = () => <p>No results</p>;
`;

const API: PublicApi = {
  names: new Set(['Stack']),
  dirs: new Map([['Stack', new Set(['Stack'])]]),
  internal: new Set(['NavPanel', 'NavPanelItem', 'ButtonBase']),
};

const parse = (files: Record<string, string>) =>
  parseGuidelines({ dir: makeDir(files), version: '1.0.0', api: API });

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe('parseFrontmatter', () => {
  it('parses scalars, numbers, lists, quotes and trailing comments', () => {
    const result = parseFrontmatter(
      `---\ntitle: "A: B"\ndescription: 'Use when # quoted'\ncomponents: [Stack, 'Flex']\nkeywords: []\norder: 10   # sort\n---\n# Body`,
    );
    expect(result?.data).toEqual({
      title: 'A: B',
      description: 'Use when # quoted',
      components: ['Stack', 'Flex'],
      keywords: [],
      order: 10,
    });
    expect(result?.body).toBe('# Body');
  });

  it('returns undefined without frontmatter', () => {
    expect(parseFrontmatter('# Title')).toBeUndefined();
  });
});

describe('splitSections', () => {
  it('splits on H2 and ignores headings inside code fences', () => {
    const { h1, sections } = splitSections(
      '# T\n\nintro\n\n## What you use\n\n```md\n## not a heading\n```\n\n## Rules\n\nx',
    );
    expect(h1).toBe('T');
    expect(sections.map(s => s.id)).toEqual(['what-you-use', 'rules']);
    expect(sections[0]?.markdown).toContain('## not a heading');
  });

  it('kebab-cases headings', () => {
    expect(toSectionId('What your app owns')).toBe('what-your-app-owns');
  });
});

describe('countProseWords', () => {
  it('counts prose words and skips fenced code', () => {
    expect(
      countProseWords(
        "# Title\n\n| Need | Use |\n|---|---|\n| a gap | `gap-12` |\n\n```tsx\n<Stack gap={12} />\n```\n\nDon't stop.",
      ),
    ).toBe(8);
  });
});

describe('parseGuidelines', () => {
  it('emits schema-valid metadata for a valid tree', () => {
    const result = parse({
      'rules.md': 'Rules first line.\n- a -> b',
      'foundations/spacing.md': FOUNDATION,
      'patterns/empty.md': PATTERN,
      'patterns/empty.stories.tsx': STORIES,
    });
    expect(guidelinesMetadataSchema.safeParse(result).success).toBe(true);
    expect(result.guidelines.map(g => [g.slug, g.kind])).toEqual([
      ['foundations/spacing', 'foundation'],
      ['patterns/empty', 'pattern'],
    ]);
    expect(result.guidelines[0]?.markdown.startsWith('# Spacing')).toBe(true);
    expect(result.guidelines[0]?.sections.map(s => s.id)).toEqual([
      'what-you-use',
      'rules',
      'examples',
      'reference',
    ]);
  });

  it('requires every pattern section', () => {
    expect(() =>
      parse({
        'rules.md': 'ok',
        'patterns/empty.md': PATTERN.replace('## States', '## Other'),
        'patterns/empty.stories.tsx': STORIES,
      }),
    ).toThrow(/patterns\/empty\.md: missing required section "## States"/);
  });

  it('enforces the word budget per kind, ignoring code fences', () => {
    const words = (n: number) => Array.from({ length: n }, () => 'word').join(' ');
    const code = `\n\n\`\`\`tsx\n${words(2000)}\n\`\`\`\n`;
    expect(() =>
      parse({
        'rules.md': 'ok',
        'foundations/spacing.md': `${FOUNDATION}\n${words(700)}\n`,
        'patterns/empty.md': `${PATTERN}\n${words(1000)}\n`,
        'patterns/empty.stories.tsx': STORIES,
      }),
    ).toThrow(
      /foundations\/spacing\.md: \d+ words, budget 700[\s\S]*patterns\/empty\.md: \d+ words, budget 1000/,
    );
    expect(() =>
      parse({
        'rules.md': 'ok',
        'foundations/spacing.md': `${FOUNDATION}${code}`,
        'patterns/empty.md': `${PATTERN}${code}`,
        'patterns/empty.stories.tsx': STORIES,
      }),
    ).not.toThrow();
  });

  it('collects every problem into one error', () => {
    const broken = FOUNDATION.replace('[Stack]', '[Stack, Nope]')
      .replace('## Reference', '## Other')
      .replace('../patterns/empty.md', '../patterns/missing.md')
      .replace('order: 10\n', '');
    expect(() => parse({ 'rules.md': 'x'.repeat(2001), 'foundations/spacing.md': broken })).toThrow(
      /rules\.md: 2001 chars[\s\S]*"order" must be a number[\s\S]*unknown component "Nope"[\s\S]*"## Reference"[\s\S]*broken relative link "\.\.\/patterns\/missing\.md"/,
    );
  });

  it('rejects missing frontmatter and a wrong H1', () => {
    expect(() =>
      parse({
        'rules.md': 'ok',
        'foundations/a.md': '# A\n',
        'foundations/b.md': FOUNDATION.replace('# Spacing', '# Spacing!'),
      }),
    ).toThrow(
      /foundations\/a\.md: missing YAML frontmatter[\s\S]*H1 must equal the title "Spacing"/,
    );
  });

  it('attaches a pattern story file in export order and checks its title', () => {
    const result = parse({
      'rules.md': 'ok',
      'patterns/empty.md': PATTERN,
      'patterns/empty.stories.tsx': STORIES,
    });
    expect(result.guidelines[0]?.stories).toEqual([
      {
        name: 'Default',
        code: 'export const Default = () => <p>Empty</p>;',
        description: 'Nothing exists yet.',
      },
      { name: 'NoResults', code: 'export const NoResults = () => <p>No results</p>;' },
    ]);
    expect(() =>
      parse({
        'rules.md': 'ok',
        'patterns/empty.md': PATTERN,
        'patterns/empty.stories.tsx': STORIES.replace('Patterns/Empty', 'Inputs/Empty'),
      }),
    ).toThrow(/empty\.stories\.tsx meta title must be "Patterns\/Empty" \(found "Inputs\/Empty"\)/);
  });

  it('parses a template: its own sections and a Templates/<title> stories file', () => {
    const template = PATTERN.replace(
      /## When to use[\s\S]*?## Examples/,
      '## What it shows\n\nText.\n\n## Examples',
    ).replace('## States\n\nText.\n\n## What your app owns\n\nText.\n\n', '');
    const [g] = parse({
      'rules.md': 'ok',
      'templates/empty.md': template,
      'templates/empty.stories.tsx': STORIES.replace('Patterns/Empty', 'Templates/Empty'),
    }).guidelines;
    expect([g?.slug, g?.kind, g?.stories?.map(s => s.name)]).toEqual([
      'templates/empty',
      'template',
      ['Default', 'NoResults'],
    ]);
    expect(() =>
      parse({
        'rules.md': 'ok',
        'templates/empty.md': template,
        'templates/empty.stories.tsx': STORIES,
      }),
    ).toThrow(/meta title must be "Templates\/Empty" \(found "Patterns\/Empty"\)/);
  });

  it('resolves story refs to their description and code in markdown and sections', () => {
    const [g] = parse({
      'rules.md': 'ok',
      'patterns/empty.md': PATTERN,
      'patterns/empty.stories.tsx': STORIES,
    }).guidelines;
    const examples = g?.sections.find(s => s.id === 'examples')?.markdown;
    expect(examples).toBe(
      [
        'The main case.',
        'Nothing exists yet.',
        '```tsx story=Default\nexport const Default = () => <p>Empty</p>;\n```',
        'Search matched nothing.',
        '```tsx story=NoResults\nexport const NoResults = () => <p>No results</p>;\n```',
      ].join('\n\n'),
    );
    expect(g?.markdown).toContain(examples);
    expect(g?.markdown).not.toContain('```story');
  });

  it('rejects tsx in pattern examples, too few refs, unknown and unused stories', () => {
    const md = PATTERN.replace(
      '```story\nNoResults\n```',
      '```story\nMissing\n```\n\n```tsx\n<p />\n```',
    );
    expect(() =>
      parse({ 'rules.md': 'ok', 'patterns/empty.md': md, 'patterns/empty.stories.tsx': STORIES }),
    ).toThrow(
      /"## Examples" may hold only ```story refs[\s\S]*unknown story "Missing" \(exports of empty\.stories\.tsx: Default, NoResults\)[\s\S]*story "NoResults" of empty\.stories\.tsx is referenced 0 times/,
    );
    expect(() =>
      parse({
        'rules.md': 'ok',
        'patterns/empty.md': PATTERN.replace('```story\nNoResults\n```', ''),
        'patterns/empty.stories.tsx': STORIES,
      }),
    ).toThrow(/"## Examples" has 1 ```story refs \(min 2\)/);
    expect(() =>
      parse({
        'rules.md': 'ok',
        'patterns/empty.md': PATTERN.replace(
          '## States\n\nText.',
          '## States\n\n```story\nDefault\n```',
        ),
        'patterns/empty.stories.tsx': STORIES,
      }),
    ).toThrow(/story "Default" of empty\.stories\.tsx is referenced 2 times/);
  });

  it('validates the real guidelines directory', () => {
    const src = path.resolve(__dirname, '../../../src');
    const project = new Project({
      tsConfigFilePath: path.resolve(src, '../tsconfig.app.json'),
      skipAddingFilesFromTsConfig: true,
    });
    const result = parseGuidelines({
      dir: GUIDELINES_DIR,
      version: '0.0.0',
      api: collectPublicApi(project, src),
    });
    expect(result.guidelines.length).toBeGreaterThan(0);
  });
});

describe('internal components in guidelines', () => {
  it('rejects an internal component in frontmatter "components"', () => {
    expect(() =>
      parse({
        'rules.md': 'ok',
        'foundations/spacing.md': FOUNDATION.replace('[Stack]', '[Stack, NavPanel]'),
      }),
    ).toThrow(
      /foundations\/spacing\.md: internal component "NavPanel" in "components" \(not exported to consumers\)/,
    );
  });

  it('rejects internal imports and JSX tags in tsx fences', () => {
    const md = [
      '```tsx',
      "import { NavPanelItem, Stack } from '@wallarm-org/design-system';",
      "import { ButtonBase } from '@wallarm-org/design-system/ButtonBase';",
      '<NavPanel><Stack /></NavPanel>',
      '```',
    ].join('\n');
    expect(findInternalUsage(md, API.internal)).toEqual([
      'tsx example imports internal "NavPanelItem"',
      'tsx example imports internal "@wallarm-org/design-system/ButtonBase"',
      'tsx example imports internal "ButtonBase"',
      'tsx example renders internal <NavPanel>',
    ]);
    expect(findInternalUsage('```tsx\n<Stack gap={12} />\n```', API.internal)).toEqual([]);
    expect(() =>
      parse({
        'rules.md': 'ok',
        'foundations/spacing.md': FOUNDATION.replace('<Stack gap={12} />', '<NavPanelItem />'),
      }),
    ).toThrow(/foundations\/spacing\.md: tsx example renders internal <NavPanelItem>/);
  });

  it('rejects backticked internal names in prose, outside code fences', () => {
    expect(
      findInternalUsage('Use `RemoteShell`, not `<NavPanelItem>` or NavPanel.', API.internal),
    ).toEqual(['prose names internal `NavPanelItem` (not exported to consumers); rephrase']);
    expect(() =>
      parse({ 'rules.md': 'Never use `NavPanel`.', 'foundations/spacing.md': FOUNDATION }),
    ).toThrow(/rules\.md: prose names internal `NavPanel`/);
  });

  const STACK_INDEX = "export { Stack } from './Stack';\nexport const Hidden = 1;";
  const storyWith = (imports: string) => `${imports}
const meta = { title: 'Patterns/Empty' };
export default meta;

export const Default = () => <Stack />;
export const NoResults = () => <Stack />;
`;
  const parseSrc = (stories: string) => {
    const src = makeDir({
      'guidelines/rules.md': 'ok',
      'guidelines/patterns/empty.md': PATTERN,
      'guidelines/patterns/empty.stories.tsx': stories,
      'components/Stack/index.ts': STACK_INDEX,
      'components/Stack/Stack.tsx': 'export const Stack = () => null;',
    });
    return parseGuidelines({ dir: path.join(src, 'guidelines'), version: '1.0.0', api: API });
  };

  it('accepts pattern stories that import a public component index', () => {
    const [g] = parseSrc(storyWith("import { Stack } from '../../components/Stack';")).guidelines;
    expect(g?.stories?.[0]?.code).toContain("from '@wallarm-org/design-system/Stack'");
  });

  it('rejects internal, deep and unexported imports in pattern stories', () => {
    expect(() =>
      parseSrc(storyWith("import { NavPanel as Stack } from '../../components/NavPanel';")),
    ).toThrow(
      /patterns\/empty\.stories\.tsx: imports internal component "\.\.\/\.\.\/components\/NavPanel"/,
    );
    expect(() =>
      parseSrc(storyWith("import { Stack } from '../../components/Stack/Stack';")),
    ).toThrow(/deep import "\.\.\/\.\.\/components\/Stack\/Stack"/);
    expect(() =>
      parseSrc(storyWith("import { Hidden as Stack } from '../../components/Stack';")),
    ).toThrow(
      /imports "Hidden" from "\.\.\/\.\.\/components\/Stack", which components\/Stack\/index\.ts does not export/,
    );
  });

  it('rejects extracted story code with a non-public import', () => {
    const story = (spec: string) => ({
      name: 'Default',
      code: `import { x } from '${spec}';\n\nexport const Default = () => x;`,
    });
    const check = (spec: string) =>
      findPrivateStoryImports('/src/guidelines/patterns/a.stories.tsx', '/src', [story(spec)], API);
    for (const ok of [
      'react',
      '@wallarm-org/design-system',
      '@wallarm-org/design-system/Stack',
      '@wallarm-org/design-system/icons',
    ]) {
      expect(check(ok), ok).toEqual([]);
    }
    for (const bad of [
      '../../components/Stack/lib/x',
      '@wallarm-org/design-system/NavPanel',
      '@wallarm-org/design-system/utils/cn',
    ]) {
      expect(check(bad), bad).toEqual([`story "Default" extracts as a non-public import "${bad}"`]);
    }
  });
});

describe('collectPublicApi', () => {
  it('excludes internal dirs and their exports from the public API', () => {
    const src = path.resolve(__dirname, '../../../src');
    const project = new Project({
      tsConfigFilePath: path.resolve(src, '../tsconfig.app.json'),
      skipAddingFilesFromTsConfig: true,
    });
    const api = collectPublicApi(project, src);
    expect(api.names.has('Button')).toBe(true);
    expect(api.dirs.has('Button')).toBe(true);
    for (const name of [
      'NavPanel',
      'NavPanelItem',
      'ButtonBase',
      'Polymorphic',
      'TemporalSegment',
    ]) {
      expect(api.internal.has(name), name).toBe(true);
      expect(api.names.has(name), name).toBe(false);
    }
    expect(api.dirs.has('NavPanel')).toBe(false);
  });
});
