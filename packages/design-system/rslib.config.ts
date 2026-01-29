import { pluginReact } from '@rsbuild/plugin-react';
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
    target: 'web',
    copy: [{ from: 'src/theme', to: 'theme' }],
  },
  source: {
    entry: {
      index: [
        './src/**/*.{ts,tsx}',
        '!./src/**/*.test.{ts,tsx}',
        '!./src/**/*.stories.{ts,tsx}',
        '!./src/**/*.e2e.{ts,tsx}',
      ],
    },
    tsconfigPath: './tsconfig.app.json',
  },
  plugins: [pluginReact()],
});
