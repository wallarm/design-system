export const baseConfig = {
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    passWithNoTests: true,
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}', '**/__tests__/**/*.{js,ts,jsx,tsx}'],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'coverage/',
      '**/*.e2e.{js,ts,jsx,tsx}',
      '**/*.config.{js,ts,mjs,cjs}',
      '**/vitest.config.{js,ts,mjs,cjs}',
    ],
    testTimeout: 10000,
  },
};
