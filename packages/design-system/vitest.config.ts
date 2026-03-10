import { defineConfig } from 'vitest/config';
import { reactConfig } from '@wallarm-org/vitest-config/react';

export default defineConfig({
  ...reactConfig,
  test: {
    ...reactConfig.test,
    setupFiles: ['./vitest.setup.ts'],
  },
});
