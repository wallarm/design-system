import { defineConfig } from '@playwright/test';
import { dockerConfig } from '@wallarm/playwright-config/docker';

export default defineConfig({
  ...dockerConfig,
  testDir: './src',
  testMatch: '**/*.e2e.ts',

  // UI-specific Docker configuration
  use: {
    ...dockerConfig.use,
    baseURL: process.env.STORYBOOK_URL || 'http://host.docker.internal:6006',
  },
});
