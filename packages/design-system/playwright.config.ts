import { defineConfig } from '@playwright/test';
import { baseConfig } from '@wallarm-org/playwright-config/base';

const DEFAULT_URL = 'http://localhost:6006';
const envUrl = process.env.STORYBOOK_URL || DEFAULT_URL;
const baseURL = envUrl.endsWith('/') ? envUrl : `${envUrl}/`;

export default defineConfig({
  ...baseConfig,
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  use: {
    ...baseConfig.use,
    baseURL,
  },
});
