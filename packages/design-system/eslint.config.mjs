import { config } from '@wallarm/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    files: ['scripts/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['storybook-static/**'],
  },
];
