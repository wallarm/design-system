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
    // Theme CSS and fonts are copied verbatim; skip the Pixel story that lives there.
    copy: [{ from: 'src/theme', to: 'theme', globOptions: { ignore: ['**/*.stories.*'] } }],
  },
  source: {
    entry: {
      index: [
        './src/**/*.{ts,tsx}',
        // Non-runtime files — never published. Keep in sync with the `exclude`
        // list in tsconfig.app.json (it drives the emitted .d.ts files).
        '!./src/**/*.test.*', // unit tests and shared helpers (*.test.helpers.tsx)
        '!./src/**/*.spec.*',
        '!./src/**/*.e2e.*',
        '!./src/**/*.stories.*',
        '!./src/**/*.figma.*', // Figma Code Connect bindings (read from source by `figma connect`)
        '!./src/**/__tests__/**',
        '!./src/**/stories/**', // story-only fixtures and mock providers
        '!./src/**/story-content/**', // story-only helpers (fixtures, the TanStack Router harness)
        '!./src/**/mocks.{ts,tsx}',
        '!./src/testUtils/**',
      ],
    },
    tsconfigPath: './tsconfig.app.json',
  },
  // Ship React Compiler output in the published package (target React 19,
  // per peerDependencies). See packages/configs/rsbuild-config for details.
  plugins: [pluginReact({ reactCompiler: true })],
});
