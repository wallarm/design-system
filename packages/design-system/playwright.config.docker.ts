import { defineConfig } from '@playwright/test';

import { dockerConfig } from '@wallarm/playwright-config/docker';

const DEFAULT_DOCKER_URL = 'http://host.docker.internal:6006';
const envUrl = process.env.STORYBOOK_URL || DEFAULT_DOCKER_URL;
const baseURL = envUrl.endsWith('/') ? envUrl : `${envUrl}/`;

export default defineConfig({
  ...dockerConfig,
  testDir: './src',
  testMatch: '**/*.e2e.ts',

  // UI-specific Docker configuration
  use: {
    ...dockerConfig.use,
    baseURL,
  },
});
