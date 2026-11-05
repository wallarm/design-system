import { defineConfig, mergeRstestConfig } from '@rstest/core';
import { reactConfig } from '@wallarm-org/rstest-config/react';

export default defineConfig(
  mergeRstestConfig(reactConfig, {
    testEnvironment: { name: 'jsdom', prebundle: false },
    setupFiles: ['./rstest.setup.ts'],
    retry: 2,
  }),
);
