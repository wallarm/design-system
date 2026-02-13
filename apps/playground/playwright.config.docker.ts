import { defineConfig } from '@playwright/test';

import { dockerConfig } from '@wallarm-org/playwright-config/docker';

export default defineConfig({
  ...dockerConfig,
  testDir: './tests',
  testMatch: '**/*.e2e.ts',

  // Web-specific Docker configuration
  use: {
    ...dockerConfig.use,
    baseURL: process.env.WEB_APP_URL || 'http://host.docker.internal:3000',
  },
});
