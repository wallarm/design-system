import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'CodeEditor.stories.tsx'),
  'utf8',
);
const lines = source.split('\n');

/**
 * Story exports only: sample documents in template literals may contain lines that start with
 * `export const` too (the TypeScript sample does), so the story type anchors the match.
 */
const storyExports = lines.flatMap((line, index) => {
  const name = /^export const (\w+): StoryFn</.exec(line)?.[1];
  return name ? [{ name, index }] : [];
});

const description = /const DESCRIPTION = \[([\s\S]*?)\]\.join\(' '\);/.exec(source)?.[1] ?? '';

/**
 * Guards the Overview page (storybook-docs skill): lint and typecheck cannot see a
 * missing sentence or a description that lost one of the facts the spec requires.
 */
describe('CodeEditor Storybook docs', () => {
  it('feeds DESCRIPTION into the meta component description', () => {
    expect(source.match(/^const DESCRIPTION = \[/gm)).toHaveLength(1);
    expect(source).toMatch(/docs:\s*\{\s*description:\s*\{\s*component:\s*DESCRIPTION\s*\}\s*\}/);
  });

  it('names the boundary, the adapter, the visual differences, the envelope and the keyboard', () => {
    expect(description).toContain('`CodeSnippet`');
    expect(description).toContain('`CodeSnippetAdapterProvider`');
    expect(description).toContain('scrollbar');
    expect(description).toContain('2 000 lines');
    expect(description).toContain('`CODE_EDITOR_KEYBOARD_HINT`');
    expect(description).toContain('Escape, then Tab');
  });

  it('names the syntax-error sources, their known gaps and the props to memoise', () => {
    expect(description).toContain('best-effort');
    expect(description).toContain('Babel');
    expect(description).toContain('Lezer');
    expect(description).toContain('`lambda a, /, b`');
    expect(description).toContain('parenthesised `with`');
    for (const prop of ['`lines`', '`folds`', '`completions`', '`schema`']) {
      expect(description).toContain(prop);
    }
  });

  it('explains how to space editors around the display:contents wrapper', () => {
    expect(description).toContain('`display: contents`');
    expect(description).toContain('`gap`');
    expect(description).toContain('`space-*`');
  });

  it('includes the stories the E2E suite drives', () => {
    expect(storyExports.map(story => story.name)).toEqual(
      expect.arrayContaining(['EditingWorkflow', 'TabsKeepHistory', 'LongDocument']),
    );
  });

  it('counts every `export const` line that is not inside a sample as a story', () => {
    const exportLines = lines.filter(line => /^export const \w+/.test(line));
    const sampleExports = exportLines.filter(line => !/^export const \w+: StoryFn</.test(line));
    expect(sampleExports).toEqual([
      'export const activeRules = (rules: readonly Rule[]): Rule[] =>',
    ]);
  });

  it.each(storyExports)('documents $name with a JSDoc sentence directly above it', ({ index }) => {
    expect(lines[index - 1]?.trim()).toMatch(/\*\/$/);
  });

  it('has no story-level description that would shadow the JSDoc', () => {
    expect(source).not.toMatch(/description:\s*\{\s*story:/);
  });
});
