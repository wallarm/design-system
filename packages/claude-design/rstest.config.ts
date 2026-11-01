import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'node',
  include: ['src/**/*.test.ts'],
  testTimeout: 60000,
  hookTimeout: 60000,
});
