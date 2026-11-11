import { resolve } from 'node:path';

import { defineConfig } from '@rslib/core';

import { prepareBundleEntry } from './src/bundle/build-bundle';
import { canvasRslibConfig } from './src/bundle/rslib-build';
import { PACKAGE_DIR } from './src/config';

// `rslib build` here builds only bundle.js, for inspecting it (e.g. `RSDOCTOR=true`), into
// `.claude-design/rslib/`. `export` runs the whole Claude Design build through the same config.
export default defineConfig(async () =>
  canvasRslibConfig({
    entries: { bundle: (await prepareBundleEntry()).entry },
    outDir: resolve(PACKAGE_DIR, '.claude-design/rslib'),
  }),
);
