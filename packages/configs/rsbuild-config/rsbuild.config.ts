import { defineConfig } from '@rsbuild/core';
import * as rspack from '@rspack/core';
import { pluginReact } from '@rsbuild/plugin-react';

export const rsbuildConfig = defineConfig({
  plugins: [pluginReact()],
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
