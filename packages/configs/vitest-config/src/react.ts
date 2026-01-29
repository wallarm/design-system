import { baseConfig } from './base.js';

export const reactConfig = {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'jsdom',
    globals: true,
    testTimeout: 15000,
  },
};
