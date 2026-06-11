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

### Step 0: Identify interactive targets (before scaffolding)

Before writing files, decide what the component's **interactive targets** are — every element a user clicks, types into, or toggles. This drives the API shape because each target must be analytics-ready. Match the target shape to the right seam using the **Decision Tree** in [`docs/metrics/contract.md`](../../../docs/metrics/contract.md), then walk [`docs/metrics/new-component-checklist.md`](../../../docs/metrics/new-component-checklist.md).

For scaffolding, the practical fork is the root element type:

- **No interactive target** (pure layout/display, e.g. a `<div>` container) → keep the generic `HTMLAttributes<HTMLDivElement>` template below as-is.
- **Interactive root or sub-components** → switch each target to its element-specific attribute type and spread `{...rest}` onto the real node (the checklist lists the type per element; multiple targets → one exported sub-component each). Never add analytics-specific props or escape hatches.

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

// NOTE: `HTMLAttributes<HTMLDivElement>` is correct only for a non-interactive
// container root. If the root (or a sub-component) is a real <button>/<a>/<input>,
// switch to the element-specific attribute type (ButtonHTMLAttributes, etc.) so
// consumer data-*/aria-*/event props reach the interactive target. See Step 0.
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
3. If the component is interactive, satisfy the analytics-readiness contract: element-specific typing on each target, `{...rest}` pass-through to the real node, event composition, no analytics-specific props. Walk [`docs/metrics/new-component-checklist.md`](../../../docs/metrics/new-component-checklist.md) and, if the component is wrapper-level or has a closed-target gap, record it in the component folder (test comments or an `ANALYTICS_GAPS.md`).
4. Add proper Storybook stories showing all variants (and, for interactive components, a story that shows where `data-analytics-id` goes)
5. Run `pnpm typecheck` to verify no type errors
6. Run `pnpm lint` to verify linting passes
7. Suggest writing tests (unit and/or E2E) based on component complexity — for interactive components, include the metrics tests from [`docs/metrics/testing-examples.md`](../../../docs/metrics/testing-examples.md)
