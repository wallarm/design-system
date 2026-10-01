import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import * as rspack from '@rspack/core';

export const rsbuildConfig = defineConfig({
  // React Compiler (Rust/SWC port built into Rspack >= 2.1, exposed by
  // @rsbuild/plugin-react). Target defaults to React 19, matching the DS
  // peerDependencies, so compiled output imports `react/compiler-runtime`
  // from the consumer's React — no extra runtime dependency.
  plugins: [pluginReact({ reactCompiler: true })],
  tools: {
    rspack: {
      plugins: [
        new rspack.CircularDependencyRspackPlugin({
          failOnError: true,
          exclude: /node_modules/,
        }),
      ].filter(Boolean),
    },
  },
});
