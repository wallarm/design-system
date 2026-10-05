import { defineConfig, type RstestConfig } from '@rstest/core';

// On CI the unit-test-report job collects `packages/*/test-results/junit.xml`.
// Rstest's CLI cannot set a reporter output path, so the JUnit file lives here.
// Listing reporters explicitly disables Rstest's automatic GitHub Actions
// reporter, so it is re-added for inline annotations.
const ciReporters: RstestConfig['reporters'] = [
  'default',
  'github-actions',
  ['junit', { outputPath: './test-results/junit.xml' }],
];

export const baseConfig: RstestConfig = defineConfig({
  globals: true,
  testEnvironment: 'node',
  passWithNoTests: true,
  include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/*.e2e.{js,ts,jsx,tsx}',
    '**/*.config.{js,ts,mjs,cjs}',
  ],
  testTimeout: 10000,
  reporters: process.env.CI ? ciReporters : ['default'],
  coverage: {
    provider: 'v8',
  },
});
