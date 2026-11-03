import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc', 'react', 'jsx-a11y', 'import'],
  // Use Oxlint's default correctness severity for the native plugins.
  categories: { correctness: 'warn' },
  env: { browser: true, node: true },
  // A suppression must keep earning its place; stale ones fail lint.
  options: { reportUnusedDisableDirectives: 'error' },
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
    '**/.claude-design/**',
    'packages/claude-design/src/assets/cover.html',
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

    // TypeScript already rejects invalid redeclarations; type + value pairs are intentional.
    'no-redeclare': 'off',
    // Compiler bailouts are audited by `pnpm compiler:audit`, including deliberate 'use no memo'.
    'react/incompatible-library': 'off',
    // Static positional lists (skeletons, segments) are keyed by index on purpose.
    'react/no-array-index-key': 'off',
    // Components put ARIA roles on styled elements by design.
    'jsx-a11y/prefer-tag-over-role': 'off',
    // Safari/VoiceOver drops list semantics from `list-style: none` lists without role='list'.
    'jsx-a11y/no-redundant-roles': ['warn', { ul: ['list'], ol: ['list'] }],
    // Pointer handlers mark a widget; key handlers on wrappers only see keys bubbling from
    // focusable children. Conditional `role={...}` is checked by the component's own tests.
    'jsx-a11y/no-static-element-interactions': [
      'warn',
      { allowExpressionValues: true, handlers: ['onClick', 'onMouseDown', 'onMouseUp'] },
    ],
    'jsx-a11y/no-noninteractive-element-interactions': [
      'warn',
      { handlers: ['onClick', 'onMouseDown', 'onMouseUp'] },
    ],

    // Readability: one obvious way to write common constructs.
    'arrow-body-style': 'error',
    curly: ['error', 'multi-line'],
    'default-case-last': 'error',
    'default-param-last': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-else-return': 'error',
    'no-lone-blocks': 'error',
    'no-lonely-if': 'error',
    'no-param-reassign': 'error',
    'no-unneeded-ternary': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'one-var': ['error', 'never'],
    'operator-assignment': 'error',
    'prefer-const': 'error',
    'prefer-exponentiation-operator': 'error',
    'prefer-rest-params': 'error',
    'prefer-template': 'error',
    yoda: 'error',
    'react/jsx-boolean-value': 'error',
    // Children stay free so `{'// text'}` can render without tripping jsx-no-comment-textnodes.
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'ignore' }],
    'react/jsx-fragments': 'error',
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],

    // Correctness and safety rules carried over from the Biome configuration.
    'default-case': 'error',
    'no-array-constructor': 'error',
    'no-case-declarations': 'error',
    'no-constructor-return': 'error',
    'no-empty': 'error',
    'no-extra-label': 'error',
    'no-fallthrough': 'error',
    'no-inner-declarations': 'error',
    'no-label-var': 'error',
    'no-new-wrappers': 'error',
    'no-prototype-builtins': 'error',
    'no-regex-spaces': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    // `void promise` marks a deliberately unawaited call.
    'no-void': ['error', { allowAsStatement: true }],
    'prefer-numeric-literals': 'error',
    'prefer-regex-literals': 'error',
    'react/jsx-no-comment-textnodes': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/no-danger': 'error',
  },
  overrides: [
    // CLIs and build scripts report progress on stdout; stories log demo events.
    {
      files: [
        '**/scripts/**',
        'packages/configs/publishing/**',
        'packages/mcp/src/index.ts',
        'packages/migrator/src/cli.ts',
        '**/*.stories.{ts,tsx}',
      ],
      rules: { 'no-console': 'off' },
    },
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
      files: ['apps/website/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'better-tailwindcss/no-unknown-classes': [
          'warn',
          {
            cwd: `${import.meta.dirname}/apps/website`,
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
