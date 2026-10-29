import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'node',
  include: ['claude-design/**/*.test.ts'],
  testTimeout: 60000,
  hookTimeout: 60000,
});
