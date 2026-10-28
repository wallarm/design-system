import { mkdtemp, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from '@rstest/core';

import { buildPreviews, previewGroups } from './build-previews';

const storyNames = (code: string) =>
  [...code.matchAll(/\{name:"((?:[^"\\]|\\.)*)",story:/g)].map(m => m[1]);

describe('preview splitting', () => {
  it('splits an oversized preview into parts that cover every story', async () => {
    const { rows } = (await previewGroups(['Button'])).groups[0]!;
    const whole = await mkdtemp(join(tmpdir(), 'previews-whole-'));
    await buildPreviews({ outDir: whole, only: ['Button'] });
    const size = (await readFile(join(whole, 'components/Button/stories.js'))).length;

    const out = await mkdtemp(join(tmpdir(), 'previews-split-'));
    await buildPreviews({ outDir: out, only: ['Button'], maxBytes: size - 1 });
    const dir = join(out, 'components/Button');
    const files = (await readdir(dir)).sort();
    expect(files).toContain('stories-1.js');
    expect(files).toContain('stories-2.js');
    expect(files).not.toContain('stories.js');
    const shipped: (string | undefined)[] = [];
    for (const html of files.filter(file => /^preview(-\d+)?\.html$/.test(file)))
      expect(await readFile(join(dir, html), 'utf8')).toMatch(
        /^<!-- @dsCard group="[^"]+" height=\d+/,
      );
    expect(files).toContain('preview-2.html');
    for (const script of files.filter(file => /^stories-\d+\.js$/.test(file))) {
      const code = await readFile(join(dir, script), 'utf8');
      expect(code.length).toBeLessThanOrEqual(size - 1);
      shipped.push(...storyNames(code));
    }
    expect(shipped.sort()).toEqual(rows.map(row => row.story).sort());
  });

  it('throws when a single story exceeds the cap', async () => {
    const out = await mkdtemp(join(tmpdir(), 'previews-tiny-'));
    await expect(buildPreviews({ outDir: out, only: ['Button'], maxBytes: 1 })).rejects.toThrow(
      /even with one story per part/,
    );
  });
});
