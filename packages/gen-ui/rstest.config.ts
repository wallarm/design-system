import { defineConfig, mergeRstestConfig } from '@rstest/core';
import { reactConfig } from '@wallarm-org/rstest-config/react';

export default defineConfig(
  mergeRstestConfig(reactConfig, { testEnvironment: 'jsdom', setupFiles: ['./rstest.setup.ts'] }),
);
