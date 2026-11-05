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
    // Fallback snapshot for projects where the server can't find an installed design system.
    copy: [
      { from: '../design-system/dist/metadata/components.json', to: 'metadata/' },
      { from: '../design-system/dist/metadata/guidelines.json', to: 'metadata/' },
    ],
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
