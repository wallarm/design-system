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
          // The built design system is a dependency here, as in node_modules for a real
          // consumer: cycles inside it are the library's, not the app's.
          exclude: /node_modules|packages\/design-system\/dist\//,
        }),
      ],
    },
  },
});
