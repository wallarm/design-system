import { afterEach, describe, expect, it } from '@rstest/core';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { guidelinesMetadataSchema } from '@wallarm-org/mcp-core';
import {
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

${['When to use', 'Anatomy', 'Layout and spacing', 'States', 'Rules', 'Example', 'What your app owns', 'Related'].map(h => `## ${h}\n\nText.`).join('\n\n')}
`;

const parse = (files: Record<string, string>) =>
  parseGuidelines({ dir: makeDir(files), version: '1.0.0', knownComponents: new Set(['Stack']) });

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
      '# T\n\nintro\n\n## Layout and spacing\n\n```md\n## not a heading\n```\n\n## Rules\n\nx',
    );
    expect(h1).toBe('T');
    expect(sections.map(s => s.id)).toEqual(['layout-and-spacing', 'rules']);
    expect(sections[0]?.markdown).toContain('## not a heading');
  });

  it('kebab-cases headings', () => {
    expect(toSectionId('What your app owns')).toBe('what-your-app-owns');
  });
});

describe('parseGuidelines', () => {
  it('emits schema-valid metadata for a valid tree', () => {
    const result = parse({
      'rules.md': 'Rules first line.\n- a -> b',
      'foundations/spacing.md': FOUNDATION,
      'patterns/empty.md': PATTERN,
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
      'reference',
    ]);
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

  it('validates the real guidelines directory', () => {
    // Root exports plus the `@wallarm-org/design-system/<Component>` subpath entries
    const src = path.resolve(__dirname, '../../../src');
    const entries = [
      path.join(src, 'index.ts'),
      ...fs
        .readdirSync(path.join(src, 'components'))
        .map(name => path.join(src, 'components', name, 'index.ts'))
        .filter(file => fs.existsSync(file)),
    ];
    const result = parseGuidelines({
      dir: GUIDELINES_DIR,
      version: '0.0.0',
      knownComponents: new Set(
        entries.flatMap(
          file => fs.readFileSync(file, 'utf-8').match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? [],
        ),
      ),
    });
    expect(result.guidelines.length).toBeGreaterThan(0);
  });
});
