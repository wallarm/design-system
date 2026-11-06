import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateNotes } from '@semantic-release/release-notes-generator';
import { defineConfig } from './releaserc.mjs';

// The preset and the generator's writer are versioned separately; a mismatch
// renders notes with headings only and no error (v0.73.0–v4.9.0 shipped empty).
test('release notes list feat and fix commits', async () => {
  const { plugins } = defineConfig({ tagFormat: 'v${version}', pkgRoot: '.' });
  const [, options] = plugins.find(([name]) => name === '@semantic-release/release-notes-generator');

  const notes = await generateNotes(options, {
    cwd: process.cwd(),
    options: { repositoryUrl: 'https://github.com/wallarm/design-system' },
    commits: [
      { hash: 'a'.repeat(40), message: 'feat(button): add size prop' },
      { hash: 'b'.repeat(40), message: 'fix(select): close on blur' },
    ],
    lastRelease: { gitTag: 'v1.0.0' },
    nextRelease: { gitTag: 'v1.1.0', version: '1.1.0' },
    logger: console,
  });

  assert.match(notes, /### Features\n\n\* \*\*button:\*\* add size prop/);
  assert.match(notes, /### Bug Fixes\n\n\* \*\*select:\*\* close on blur/);
});
