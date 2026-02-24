import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      bundle: false,
      dts: true,
    },
  ],
  output: {
    target: 'node',
  },
  source: {
    entry: {
      index: ['./src/**/*.ts'],
    },
    tsconfigPath: './tsconfig.json',
  },
});
