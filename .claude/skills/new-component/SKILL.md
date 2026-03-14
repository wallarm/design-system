# New Component Scaffolding

Scaffold a new design system component with all required files, proper structure, and registration.

## Usage

```
/new-component ComponentName [category]
```

- `ComponentName` — PascalCase component name (e.g., `Accordion`, `ProgressBar`)
- `category` — optional Storybook category (default: auto-detected)

## Storybook Categories

| Category | Components |
|----------|-----------|
| Actions | Buttons, toggles, interactive controls |
| Data Display | Cards, badges, tables, code display |
| Inputs | Text inputs, selects, checkboxes, radios |
| Layout | Stack, Flex, Separator, ScrollArea |
| Loading | Loaders, skeletons |
| Messaging | Alerts, toasts, notifications |
| Navigation | Tabs, links, segmented controls |
| Overlay | Drawers, popovers, tooltips, modals |
| Primitives | Low-level building blocks |
| Status Indication | Status indicators |
| Typography | Text, headings, code |

## Instructions

When this skill is invoked, create the following files:

### 1. `packages/design-system/src/components/{ComponentName}/classes.ts`

```typescript
import { cva } from 'class-variance-authority';

export const {componentName}Variants = cva(
  // Base classes — add appropriate defaults
  '',
  {
    variants: {
      // Add variants based on component purpose
    },
    defaultVariants: {},
  },
);
```

### 2. `packages/design-system/src/components/{ComponentName}/{ComponentName}.tsx`

```typescript
import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { {componentName}Variants } from './classes';

type {ComponentName}VariantProps = VariantProps<typeof {componentName}Variants>;

export interface {ComponentName}Props extends {ComponentName}VariantProps, HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const {ComponentName}: FC<{ComponentName}Props> = ({
  ref,
  className,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      data-slot='{component-name}'
      className={cn({componentName}Variants({}), className)}
    >
      {children}
    </div>
  );
};

{ComponentName}.displayName = '{ComponentName}';
```

### 3. `packages/design-system/src/components/{ComponentName}/index.ts`

```typescript
export { {ComponentName}, type {ComponentName}Props } from './{ComponentName}';
export { {componentName}Variants } from './classes';
```

### 4. `packages/design-system/src/components/{ComponentName}/{ComponentName}.stories.tsx`

```typescript
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { {ComponentName}, type {ComponentName}Props } from './{ComponentName}';

const meta = {
  title: '{Category}/{ComponentName}',
  component: {ComponentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '{ComponentName} component.',
      },
    },
  },
  argTypes: {
    className: { control: 'text' },
    children: { control: false },
    ref: { control: false },
  },
} satisfies Meta<typeof {ComponentName}>;

export default meta;

export const Basic: StoryFn<{ComponentName}Props> = (args) => (
  <{ComponentName} {...args}>Content</{ComponentName}>
);
```

### 5. Register in `packages/design-system/src/index.ts`

Add export line in alphabetical order:
```typescript
export { {ComponentName}, type {ComponentName}Props } from './components/{ComponentName}';
```

## After Scaffolding

1. Ask the user about the component's purpose and variants
2. Implement the actual styling and behavior
3. Add proper Storybook stories showing all variants
4. Run `pnpm typecheck` to verify no type errors
5. Run `pnpm lint` to verify linting passes
6. Suggest writing tests (unit and/or E2E) based on component complexity
