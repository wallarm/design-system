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
        // Story-only helpers (fixtures, the TanStack Router harness) — never published.
        '!./src/**/story-content/**',
        '!./src/testUtils/**',
      ],
    },
    tsconfigPath: './tsconfig.app.json',
  },
  // Ship React Compiler output in the published package (target React 19,
  // per peerDependencies). See packages/configs/rsbuild-config for details.
  plugins: [pluginReact({ reactCompiler: true })],
});
