import { expect, it } from '@rstest/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ark keeps layer stack, focus trap and scroll lock as module singletons inside @zag-js/*.
// Our direct @zag-js pins next to Ark's own zag must resolve to one version, or a second
// copy of those singletons silently breaks nested overlays (Escape, outside click, z-order).
it('resolves every @zag-js package to a single version', () => {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const lockfile = fs.readFileSync(path.resolve(dir, '../../../pnpm-lock.yaml'), 'utf8');
  const versions = new Set(
    [...lockfile.matchAll(/^ {2}'?@zag-js\/[\w-]+@(\d[^':(\s]*)/gm)].map(match => match[1]),
  );

  expect(versions.size).toBeGreaterThan(0);
  expect([...versions]).toHaveLength(1);
});
