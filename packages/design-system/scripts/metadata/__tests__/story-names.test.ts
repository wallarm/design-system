import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../../../src');

/**
 * `.storybook/main.ts` sets `docs.defaultName: 'Overview'`, so every component's
 * autodocs page owns the `--overview` story id. A story export named `Overview`
 * silently loses that id to the docs page: it disappears from the index, its URL
 * renders the docs page instead, and any e2e navigating to it times out rather
 * than failing with something readable.
 *
 * `Tour` hit exactly this — fourteen specs timed out at thirty seconds each
 * because `tourStory.goto(page, 'Overview')` was landing on documentation.
 */
const RESERVED_STORY_NAMES = ['Overview'];

const collectStoryFiles = (dir: string, found: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectStoryFiles(full, found);
    else if (entry.name.endsWith('.stories.tsx')) found.push(full);
  }
  return found;
};

describe('story names', () => {
  const files = collectStoryFiles(SRC);

  it('finds the story files', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(RESERVED_STORY_NAMES)('no story is named %s — the docs page owns that id', name => {
    const offenders = files
      .filter(file =>
        new RegExp(`^export const ${name}\\b`, 'm').test(fs.readFileSync(file, 'utf8')),
      )
      .map(file => path.relative(SRC, file));

    expect(offenders).toEqual([]);
  });
});
