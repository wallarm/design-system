import { defineConfig } from '@playwright/test';

import { baseConfig } from './base.js';

export const dockerConfig = defineConfig({
  ...baseConfig,

  // Docker-specific configuration
  use: {
    ...baseConfig.use,
    // Increase timeouts for container environment
    actionTimeout: 10000,
    navigationTimeout: 30000,
    // Artifacts configuration for Docker
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  // Longer timeouts for Docker environment
  timeout: 60000,
  expect: {
    ...baseConfig.expect,
    timeout: 10000,
  },

  // Configure test execution for Docker
  workers: 1, // One worker per container; parallelism comes from sharding
  retries: 2, // More retries in Docker due to potential network latency
  fullyParallel: true,

  // Output configuration
  outputDir: './test-results',
  reporter: [
    ['html', { outputFolder: './playwright-report', open: 'never' }],
    ['junit', { outputFile: './test-results/junit.xml' }],
    ['list'],
  ],

  globalTimeout: 600000, // Hard cap on total run time
});
