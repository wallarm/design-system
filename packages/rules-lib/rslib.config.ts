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
  },
  source: {
    entry: {
      index: [
        './src/**/*.{ts,tsx}',
        // Non-runtime files — never published
        '!./src/**/*.test.*',
        '!./src/**/*.spec.*',
        '!./src/**/__tests__/**',
        '!./src/**/mocks.{ts,tsx}',
        '!./src/testUtils/**',
      ],
    },
    tsconfigPath: './tsconfig.app.json',
  },
  // Ship React Compiler output in the published package (target React 19, per peerDependencies)
  plugins: [pluginReact({ reactCompiler: true })],
});
