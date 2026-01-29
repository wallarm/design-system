import { defineConfig } from '@playwright/test';

import { baseConfig } from '@wallarm/playwright-config/base';

export default defineConfig({
  ...baseConfig,
  testDir: './tests',
  testMatch: '**/*.e2e.ts',
  use: {
    ...baseConfig.use,
    baseURL: 'http://localhost:3000',
  },
});
