# Adding a New Component

Step-by-step guide for creating new components in Wallarm Design System.

## File Structure

All components live in `packages/design-system/src/components/`. The structure depends on component complexity:

### Simple Component

```
ComponentName/
├── ComponentName.tsx         # Component implementation
├── classes.ts                # CVA variants (if has variants)
├── types.ts                  # Type definitions (if complex)
├── constants.ts              # Constants (if needed)
├── index.ts                  # Barrel export
├── ComponentName.stories.tsx # Storybook stories
└── ComponentName.e2e.ts      # E2E tests (optional)
```

### Compound Component (with sub-components)

```
ComponentName/
├── ComponentName.tsx
├── ComponentNamePart.tsx       # Each sub-component in its own file
├── ComponentNameOtherPart.tsx
├── ComponentNameContext/       # Shared state via context
│   ├── ComponentNameContext.ts
│   ├── ComponentNameProvider.tsx
│   ├── useComponentNameContext.ts
│   └── index.ts
├── hooks/                      # Component-specific hooks
│   ├── useCustomHook.ts
│   └── index.ts
├── lib/                        # Utilities and helpers
│   ├── helpers.ts
│   └── index.ts
├── classes.ts
├── types.ts
├── constants.ts
├── index.ts
├── ComponentName.stories.tsx
└── ComponentName.e2e.ts
```

## Step 1: Create the Component

### Props Definition

Extend native HTML attributes and compose with CVA variant types:

```tsx
// ComponentName.tsx
import type { FC, HTMLAttributes, Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Define variants with CVA
const componentVariants = cva(
  // Base styles (always applied)
  'inline-flex items-center rounded-8',
  {
    variants: {
      size: {
        small: 'h-24 px-8 text-xs',
        medium: 'h-32 px-12 text-sm',
        large: 'h-40 px-16 text-base',
      },
      color: {
        primary: 'bg-bg-fill-brand text-text-primary-alt',
        neutral: 'bg-bg-surface-2 text-text-primary',
      },
    },
    defaultVariants: {
      size: 'medium',
      color: 'primary',
    },
  },
);

// Compose props: native HTML + CVA variants + custom props
type ComponentNativeProps = HTMLAttributes<HTMLDivElement>;
type ComponentVariantProps = VariantProps<typeof componentVariants>;

export interface ComponentNameProps extends ComponentNativeProps, ComponentVariantProps {
  ref?: Ref<HTMLDivElement>;
}

export const ComponentName: FC<ComponentNameProps> = ({
  ref,
  className,
  size = 'medium',
  color = 'primary',
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      className={cn(componentVariants({ size, color }), className)}
    >
      {children}
    </div>
  );
};

ComponentName.displayName = 'ComponentName';
```

### Key Patterns

**Always spread `...props` first** — then override with explicit props so internal logic wins:

```tsx
<div {...props} ref={ref} className={...}>
```

**Always allow `className` override** — merge external classes with `cn()`:

```tsx
className={cn(componentVariants({ size }), className)}
```

**Always set `displayName`** — helps with React DevTools and error messages.

**Use `data-*` attributes for state** — enables CSS targeting and testing:

```tsx
<div data-color={color} data-state={isOpen ? 'open' : 'closed'}>
```

## Step 2: Separate Variants (optional)

For components with many variants, extract styles into `classes.ts`:

```ts
// classes.ts
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const componentVariants = cva(
  cn(
    'inline-flex items-center justify-center',
    'rounded-lg transition-all cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ),
  {
    variants: {
      size: {
        small: cn('h-24', 'px-6 py-4', 'text-xs'),
        medium: cn('h-32', 'px-8 py-6', 'text-sm'),
      },
    },
    compoundVariants: [
      {
        size: 'small',
        // compound conditions
        className: 'gap-4',
      },
    ],
    defaultVariants: {
      size: 'medium',
    },
  },
);
```

Use `cn()` to wrap multi-line base styles for readability. Use `compoundVariants` when styles depend on combinations of multiple variant values.

## Step 3: Add `asChild` Support (optional)

The `asChild` pattern lets consumers render as a different element using Radix `Slot`:

```tsx
import { Slot } from '@radix-ui/react-slot';

export const ComponentName: FC<ComponentNameProps> = ({
  asChild = false,
  as,
  children,
  ...props
}) => {
  const Comp = asChild ? Slot : (as ?? 'div');

  return (
    <Comp {...props}>
      {children}
    </Comp>
  );
};
```

## Step 4: Create Context for Compound Components

When sub-components need shared state, use React Context:

```ts
// ComponentNameContext/ComponentNameContext.ts
import { createContext } from 'react';

export interface ComponentNameContextValue {
  size?: 'small' | 'medium';
  variant?: 'default' | 'outline';
}

export const ComponentNameContext = createContext<ComponentNameContextValue>({
  size: 'medium',
  variant: 'default',
});
```

```tsx
// ComponentNameContext/ComponentNameProvider.tsx
import type { FC, PropsWithChildren } from 'react';
import { ComponentNameContext, type ComponentNameContextValue } from './ComponentNameContext';

export const ComponentNameProvider: FC<PropsWithChildren<ComponentNameContextValue>> = ({
  children,
  ...value
}) => {
  return (
    <ComponentNameContext.Provider value={value}>
      {children}
    </ComponentNameContext.Provider>
  );
};
```

```ts
// ComponentNameContext/useComponentNameContext.ts
import { useContext } from 'react';
import { ComponentNameContext } from './ComponentNameContext';

export const useComponentNameContext = () => {
  const context = useContext(ComponentNameContext);

  if (!context) {
    throw new Error('useComponentNameContext must be used within a ComponentNameProvider');
  }

  return context;
};
```

## Step 5: Use Ark UI for Accessible Primitives

For interactive components (dialogs, menus, selects, tabs, etc.), use [Ark UI](https://ark-ui.com/) as the foundation:

```tsx
import { Tabs as ArkTabs } from '@ark-ui/react/tabs';
import { useFieldContext } from '@ark-ui/react/field';
import { mergeProps } from '@ark-ui/react/utils';
```

Ark UI provides accessible keyboard navigation, ARIA attributes, and focus management out of the box.

### Accessibility Checklist

- Add semantic `role` attributes (`role="alert"`, `role="dialog"`)
- Set `aria-invalid`, `aria-disabled` where applicable
- Ensure keyboard navigation (focus, Enter, Escape)
- Support `closeOnEscape` for overlay components
- Use `data-slot` for sub-component identification

## Step 6: Create Barrel Export

```ts
// index.ts (simple component)
export { ComponentName, type ComponentNameProps } from './ComponentName';

// index.ts (compound component)
export { ComponentName, type ComponentNameProps } from './ComponentName';
export { ComponentNamePart, type ComponentNamePartProps } from './ComponentNamePart';
export { COMPONENT_CONSTANT } from './constants';
```

## Step 7: Register in Package Export

Add your component to `packages/design-system/src/index.ts`:

```ts
export {
  ComponentName,
  type ComponentNameProps,
  ComponentNamePart,
  type ComponentNamePartProps,
} from './components/ComponentName';
```

The exports are sorted alphabetically by component name. Types are always exported alongside their components.

## Step 8: Write Storybook Stories

```tsx
// ComponentName.stories.tsx
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: {
      control: 'select',
      options: ['primary', 'neutral'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;

// Basic usage
export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <ComponentName {...args}>Content</ComponentName>
);

// All variants
export const Variants: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack spacing={8}>
    <ComponentName {...args} color="primary">Primary</ComponentName>
    <ComponentName {...args} color="neutral">Neutral</ComponentName>
  </HStack>
);

// All sizes
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack align="end" spacing={8}>
    <ComponentName {...args} size="small">Small</ComponentName>
    <ComponentName {...args} size="medium">Medium</ComponentName>
    <ComponentName {...args} size="large">Large</ComponentName>
  </HStack>
);
```

### Storybook Categories

Use the appropriate category for the `title` field:

| Category             | Use For                          | Examples        |
| -------------------- | -------------------------------- | --------------- |
| `Actions`            | Clickable elements               | Button, Toggle  |
| `Inputs`             | Form controls                    | Input, Checkbox |
| `Layout`             | Structural components            | Stack, ScrollArea |
| `Navigation`         | Navigation elements              | Tabs, Breadcrumb |
| `Overlay`            | Floating elements                | Dialog, Tooltip |
| `Messaging`          | Feedback messages                | Alert, Toast    |
| `Status Indication`  | Status display                   | Badge, Tag      |
| `Typography`         | Text display                     | Heading, Text   |
| `Loading`            | Loading states                   | Skeleton, Loader |
| `Primitives`         | Low-level building blocks        | Separator, Icons |
| `Data`               | Data display                     | Table, CodeSnippet |

## Step 9: Write E2E Tests

```ts
// ComponentName.e2e.ts
import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const componentStory = createStoryHelper('category-componentname', [
  'Basic',
  'Variants',
  'Sizes',
] as const);

test.describe('ComponentName', () => {
  test.describe('View', () => {
    test('Basic view', async ({ page }) => {
      await componentStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('All variants', async ({ page }) => {
      await componentStory.goto(page, 'Variants');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interaction', () => {
    test('Click behavior', async ({ page }) => {
      await componentStory.goto(page, 'Basic');

      const component = page.getByRole('button');
      await component.click();

      await expect(component).toHaveAttribute('data-state', 'active');
    });

    test('Keyboard accessible', async ({ page }) => {
      await componentStory.goto(page, 'Basic');

      const component = page.getByRole('button');
      await component.focus();
      await page.keyboard.press('Enter');

      await expect(component).toBeFocused();
    });
  });
});
```

The `createStoryHelper` ID format is `category-componentname` (lowercase, hyphen-separated), matching the Storybook `title` field.

## Step 10: Write Unit Tests (for logic)

If the component has utility functions, hooks, or complex logic — add unit tests:

```ts
// lib/helpers.test.ts
import { describe, expect, it } from 'vitest';
import { parseValue } from './helpers';

describe('parseValue', () => {
  it('parses valid input', () => {
    expect(parseValue('42')).toBe(42);
  });

  it('returns null for invalid input', () => {
    expect(parseValue('abc')).toBeNull();
  });
});
```

## Quick Reference: Utilities

| Utility          | Import                         | Purpose                         |
| ---------------- | ------------------------------ | ------------------------------- |
| `cn()`           | `../../utils/cn`               | Merge Tailwind classes safely   |
| `cva()`          | `class-variance-authority`     | Define component variants       |
| `Slot`           | `@radix-ui/react-slot`        | Render as child element         |
| `useControlled`  | `../../hooks/useControlled`    | Controlled/uncontrolled state   |
| `mergeProps`     | `@ark-ui/react/utils`         | Merge props from Ark UI context |

## Quick Reference: Design Tokens

Use Tailwind classes with design tokens instead of hardcoded values:

```
bg-bg-surface-2      (not bg-gray-100)
text-text-primary     (not text-gray-900)
border-border-primary (not border-gray-200)
rounded-8             (not rounded-md)
h-32                  (not h-8)
gap-8                 (not gap-2)
```

Token values use a 4px grid: `4`, `8`, `12`, `16`, `20`, `24`, `32`, `36`, `40`.

## Checklist

Before submitting a PR, make sure:

- [ ] Component follows the file structure pattern
- [ ] Props extend native HTML attributes
- [ ] `className` is merged via `cn()` and passed to root element
- [ ] `displayName` is set
- [ ] `ref` forwarding works
- [ ] `...props` are spread on the root element
- [ ] Barrel export (`index.ts`) is created
- [ ] Component is added to `src/index.ts`
- [ ] Storybook stories cover all variants and states
- [ ] E2E screenshot tests are written
- [ ] Accessibility is verified (ARIA, keyboard navigation)
- [ ] Design tokens used instead of hardcoded colors/sizes
- [ ] No `any` types in TypeScript
