import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig, mergeRstestConfig, type RstestConfig } from '@rstest/core';

import { baseConfig } from './base';

export const reactConfig: RstestConfig = mergeRstestConfig(
  baseConfig,
  defineConfig({
    testEnvironment: 'jsdom',
    testTimeout: 15000,
    plugins: [pluginReact()],
  }),
);
