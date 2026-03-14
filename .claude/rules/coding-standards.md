# General Coding Standards

## TypeScript

- Strict mode is enforced — no `any`, no implicit returns
- Use `type` imports for type-only imports: `import type { FC } from 'react'`
- Prefer `interface` for props, `type` for unions and intersections
- Use `satisfies` for type narrowing without widening

## Imports

- Use path aliases where configured
- Group imports: 1) React/external 2) Internal packages 3) Relative
- Biome handles import sorting — do not manually sort

## Naming

- Components: `PascalCase`
- Files: Match the primary export name (`Button.tsx`, `classes.ts`)
- Types/Interfaces: `PascalCase` with descriptive suffix (`ButtonProps`, `AlertColor`)
- Hooks: `camelCase` starting with `use` (`useTheme`, `useTour`)
- Utilities: `camelCase` (`cn`, `formatValue`)
- Constants: `UPPER_SNAKE_CASE` for true constants, `camelCase` for config objects
- CSS classes: Use Tailwind utilities, never custom CSS class names

## Formatting

- Biome handles formatting — do not argue about style
- Run `pnpm lint:fix` to auto-fix issues
- Single quotes, no semicolons (configured in Biome)

## Git

- Conventional commits are enforced by commitlint
- PR titles must follow conventional commit format
- Use `pnpm commit` for guided commit creation
