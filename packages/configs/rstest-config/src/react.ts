import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig, mergeRstestConfig, type RstestConfig } from '@rstest/core';

import { baseConfig } from './base';

export const reactConfig: RstestConfig = mergeRstestConfig(
  baseConfig,
  defineConfig({
    testEnvironment: 'jsdom',
    testTimeout: 15000,
    plugins: [pluginReact()],
    // Rstest builds with `output.target: 'node'`, and pluginReact only applies
    // its `reactCompiler` option to `web` targets — so enable the compiler on
    // the SWC transform directly, otherwise tests would run uncompiled code.
    tools: {
      swc: {
        jsc: {
          transform: {
            reactCompiler: true,
          },
        },
      },
    },
  }),
);
