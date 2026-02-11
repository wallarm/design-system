import { defineConfig } from '@playwright/test';
import { baseConfig } from '@wallarm/playwright-config/base';

export default defineConfig({
  ...baseConfig,
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  use: {
    ...baseConfig.use,
    baseURL: 'http://localhost:6006',
  },
});
