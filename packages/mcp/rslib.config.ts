import { defineConfig, rspack } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      bundle: true,
      dts: false,
      autoExtension: false,
      output: {
        filename: {
          js: 'index.js',
        },
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
      plugins: [
        new rspack.BannerPlugin({
          banner: '#!/usr/bin/env node',
          raw: true,
        }),
      ],
    },
  },
});
