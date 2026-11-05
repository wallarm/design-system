import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      bundle: true,
      dts: false,
      banner: {
        js: '#!/usr/bin/env node',
      },
    },
  ],
  output: {
    target: 'node',
    externals: [/^node:/],
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
    tsconfigPath: './tsconfig.json',
  },
  tools: {
    rspack: {
      // `rules.md?raw` (bundled fallback guidelines digest) is inlined as a string.
      module: { rules: [{ test: /\.md$/, resourceQuery: /raw/, type: 'asset/source' }] },
    },
  },
});
