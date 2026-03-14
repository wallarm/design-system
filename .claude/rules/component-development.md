# Component Development Rules

These rules apply when creating or modifying any component file in `packages/design-system/src/components/`.

## Mandatory Patterns

1. **CVA for variants** — Always use `class-variance-authority` for component variants. Define them in a separate `classes.ts` file.

2. **`cn()` for className** — Always merge classes with `cn()` from `../../utils/cn`. Never use template literals for class concatenation.

3. **`data-slot` attribute** — Every component's root element must have `data-slot='component-name'` in kebab-case.

4. **`displayName`** — Set `ComponentName.displayName = 'ComponentName'` at the end of every component file.

5. **Ref forwarding** — Accept `ref?: Ref<HTMLElement>` and pass it to the root element.

6. **Type exports** — Export both the component and its Props type from `index.ts`:
   ```typescript
   export { ComponentName, type ComponentNameProps } from './ComponentName';
   ```

7. **Storybook meta** — Use `satisfies Meta<typeof Component>` for type-safe story definitions.

8. **Story imports** — Use `import type { Meta, StoryFn } from 'storybook-react-rsbuild'`.

## Forbidden Patterns

- ❌ `any` type — use proper TypeScript types
- ❌ Inline styles — use Tailwind CSS classes
- ❌ Hardcoded colors — use design tokens (`bg-bg-*`, `text-text-*`, `border-border-*`)
- ❌ `React.forwardRef` — use `ref` prop directly (React 19+)
- ❌ Default exports for components — use named exports only
- ❌ `useEffect` for derived state — compute during render
