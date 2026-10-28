import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc', 'react', 'jsx-a11y', 'import'],
  // Use Oxlint's default correctness severity for the native plugins.
  categories: { correctness: 'warn' },
  env: { browser: true, node: true },
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/__fixtures__/**',
    '**/storybook-static/**',
    '**/*.gen.ts',
    '**/CodeEditor/engine/languages/http/parser.ts',
    '**/CodeEditor/engine/languages/http/parser.terms.ts',
    '**/playwright-report/**',
    '**/test-results/**',
    '**/coverage/**',
    '**/doc_build/**',
    '**/doc_build_local/**',
    '**/.rspress/**',
    '**/src/theme/**/*.css',
  ],
  settings: {
    'better-tailwindcss': {
      cwd: `${import.meta.dirname}/packages/design-system`,
      entryPoint: '.storybook/preview.css',
      detectComponentClasses: true,
    },
  },
  rules: {
    'no-undef': 'error',
    'no-redeclare': 'error',
    'react/rules-of-hooks': 'error',
    'typescript/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
        disallowTypeAnnotations: false,
      },
    ],
    'import/no-duplicates': 'error',
    'import/no-cycle': 'warn',
  },
  overrides: [
    { files: ['**/*.d.ts'], rules: { 'no-unused-vars': 'off' } },
    // Storybook render callbacks are component entry points.
    { files: ['**/*.stories.{ts,tsx,js,jsx,mjs,cjs}'], rules: { 'react/rules-of-hooks': 'off' } },
    {
      files: ['packages/design-system/**/*.{js,jsx,ts,tsx}', 'apps/**/*.{js,jsx,ts,tsx}'],
      jsPlugins: ['eslint-plugin-better-tailwindcss'],
      rules: {
        // Keep existing component behavior during the tooling migration.
        ...betterTailwindcss.configs['correctness-warn'].rules,
        // These classes come from unlayered CSS; detection only covers @layer components.
        'better-tailwindcss/no-unknown-classes': [
          'warn',
          {
            ignore: [
              '^sb-(annotation(-alt)?|unstyled)$',
              '^docs-frame-(rule|muted)$',
              '^lg-(frame|mesh|blob)$',
              '^animate-skeleton$',
            ],
          },
        ],
      },
    },
    {
      files: ['apps/docs/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'better-tailwindcss/no-unknown-classes': [
          'warn',
          {
            cwd: `${import.meta.dirname}/apps/docs`,
            entryPoint: 'styles/global.css',
            ignore: ['^rp-', '^sb-annotation(-alt)?$', '^lg-(frame|mesh|blob)$'],
          },
        ],
      },
    },
    // Tests deliberately pass arbitrary class names to verify forwarding and merging.
    {
      files: ['**/*.{test,spec,e2e}.{ts,tsx,js,jsx}'],
      rules: { 'better-tailwindcss/no-unknown-classes': 'off' },
    },
  ],
});
