# General Coding Standards

## TypeScript

- Strict mode is enforced — no `any`
- Use `type` imports for type-only imports: `import type { FC } from 'react'`
- Prefer `interface` for props, `type` for unions and intersections
- Use `satisfies` for type narrowing without widening

## Imports

- Use path aliases where configured
- Group imports: 1) React/external 2) Internal packages 3) Relative
- Oxfmt handles import sorting — do not manually sort

## Naming

- Components: `PascalCase`
- Files: Match the primary export name (`Button.tsx`, `useTheme.ts`)
- Types/Interfaces: `PascalCase` with descriptive suffix (`ButtonProps`, `AlertColor`)
- Hooks: `camelCase` starting with `use` (`useTheme`, `useTour`)
- Utilities: `camelCase` (`cn`, `formatValue`)
- Constants: `UPPER_SNAKE_CASE` for true constants, `camelCase` for config objects
- CSS classes: Use Tailwind utilities, never custom CSS class names

## Formatting

- Oxfmt handles formatting — do not argue about style
- Run `pnpm lint:fix` to auto-fix issues
- Single quotes, semicolons required, trailing commas (configured in `.oxfmtrc.json`)

## Linting

- Oxlint rules live in `oxlint.config.mts`; `pnpm lint` fails on errors and on stale suppressions
- When a diagnostic is wrong for a recurring pattern, tune or disable the rule there with a one-line reason
- Use `// oxlint-disable-next-line <rule> -- <reason>` only for a one-off exception

## Git

- Conventional commits are enforced by commitlint
- PR titles must follow conventional commit format
- Use `pnpm commit` for guided commit creation
