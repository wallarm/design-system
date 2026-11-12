import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [{ format: 'esm', bundle: false, dts: true }],
  plugins: [pluginReact({ reactCompiler: true })],
  source: {
    entry: { index: ['./src/**/*.{ts,tsx}', '!./src/**/*.test.*', '!./src/tests/**'] },
    tsconfigPath: './tsconfig.build.json',
  },
});
