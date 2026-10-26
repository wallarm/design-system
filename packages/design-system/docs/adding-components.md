# Adding a New Component

Step-by-step guide for creating new components in Wallarm Design System.

## File Structure

All components live in `packages/design-system/src/components/`. The structure depends on component complexity:

### Simple Component

```
ComponentName/
├── ComponentName.tsx         # Component implementation
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
├── classes.ts                  # Only when sub-components share a CVA recipe (see Step 2)
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
      data-slot='component-name'
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

**Set `data-slot` on the root** — `data-slot='component-name'` (kebab-case) on every component and sub-component root. It is a CSS hook only; tests never select by it.

**Use `data-*` attributes for state** — enables CSS targeting:

```tsx
<div data-color={color} data-state={isOpen ? 'open' : 'closed'}>
```

**Keep render pure** — the library is compiled by React Compiler: no reading or writing `ref.current` during render, no mutating props, state or module variables. Check for compiler bailouts with `pnpm --filter @wallarm-org/design-system compiler:audit`.

**Verify lint findings before changing behavior** — establish the component's contract and reproduce suspected bugs with a focused test. Preserve intentional behavior when a diagnostic does not apply: use a local exception that explains why, rather than disabling the rule globally. For example, `useControlled` freezes its mode at mount; its immutable mode ref is covered by contract tests. Publish mutable callback refs after commit so an abandoned render cannot change live callbacks.

**Make interactive targets analytics-ready** — consumer `data-*` / `aria-*` / event props must reach the real interactive DOM node. Use the element-specific attribute type (`ButtonHTMLAttributes<HTMLButtonElement>`, etc.) and spread `...props` onto that node. See the [metrics contract](https://github.com/wallarm/design-system/blob/main/docs/metrics/contract.md) and the [new-component checklist](https://github.com/wallarm/design-system/blob/main/docs/metrics/new-component-checklist.md).

## Step 2: Move Shared Variants to `classes.ts` (when shared)

Keep the `cva()` definition in the component file by default, as in Step 1. Move it to `classes.ts` only when the styles are shared — several sub-components or files import the same recipe:

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

### Test IDs for Compound Components

Compound components cascade `data-testid` to their sub-components. The root takes `'data-testid': testId` (props extend `TestableProps` from `../../utils/testId`), puts it on its root element and wraps `children` in `<TestIdProvider value={testId}>`. Each sub-component calls `useTestId('slot-name')` and renders `data-testid={testId}`, which produces `{testId}--{slot-name}`. Full pattern: [test-id-pattern.md](https://github.com/wallarm/design-system/blob/main/docs/test-id-pattern.md).

### Accessibility Checklist

- Add semantic `role` attributes (`role="alert"`, `role="dialog"`)
- Set `aria-invalid`, `aria-disabled` where applicable
- Ensure keyboard navigation (focus, Enter, Escape)
- Support `closeOnEscape` for overlay components

## Step 6: Create Barrel Export

Within a component, import shared helpers, constants, and context hooks from their defining modules. Importing them through a barrel that also exports their callers can create dependency cycles. Keep context definitions separate from the components that render their consumers, and preserve the barrel exports for public consumers.

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
import { HStack } from '../Stack';
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
  <HStack gap={8}>
    <ComponentName {...args} color="primary">Primary</ComponentName>
    <ComponentName {...args} color="neutral">Neutral</ComponentName>
  </HStack>
);

// All sizes
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack align="end" gap={8}>
    <ComponentName {...args} size="small">Small</ComponentName>
    <ComponentName {...args} size="medium">Medium</ComponentName>
    <ComponentName {...args} size="large">Large</ComponentName>
  </HStack>
);
```

### Storybook Categories

Use the appropriate category for the `title` field:

| Category            | Use For                                | Examples                         |
| ------------------- | -------------------------------------- | -------------------------------- |
| `Actions`           | Clickable elements                     | Button, ToggleButton, DropdownMenu |
| `AI`                | Wally assistant                        | Chat, AssistantMessage, ChainOfThought |
| `Brand`             | Brand marks                            | Logo, WallyIcon                  |
| `Data Display`      | Displaying data                        | Table, Card, Avatar, CodeSnippet |
| `Inputs`            | Form controls                          | Input, Checkbox, Select          |
| `Inputs Date`       | Date and time controls                 | Calendar, DateInput, TimeInput   |
| `Layout`            | Structural components                  | Stack, Flex, ScrollArea          |
| `Loading`           | Loading states                         | Loader, Skeleton, Progress       |
| `Messaging`         | Feedback messages                      | Alert, Banner, Toast             |
| `Navigation`        | Navigation elements                    | Tabs, Breadcrumbs, Pagination    |
| `Overlay`           | Floating elements                      | Dialog, Drawer, Tooltip          |
| `Pages`             | Full-page states                       | EmptyState, UtilityPage          |
| `Patterns`          | Composite patterns built from components | FilterInput, FilterDropdown    |
| `Primitives`        | Low-level building blocks              | Separator, Kbd, Icons            |
| `Status Indication` | Status display                         | Badge, Tag, Indicator            |
| `Typography`        | Text display                           | Heading, Text, Code              |

## Step 9: Write E2E Tests

Follow the naming and locator rules in [e2e-test-rules.md](https://github.com/wallarm/design-system/blob/main/docs/e2e-test-rules.md): a `Component: {Name}` suite, `Visual` / `Interactions` / `Accessibility` groups, `Should …` titles, and `data-testid` locators (`getByRole` is fine for accessibility assertions).

```ts
// ComponentName.e2e.ts
import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const componentStory = createStoryHelper('category-componentname', [
  'Basic',
  'Variants',
  'Sizes',
] as const);

test.describe('Component: ComponentName', () => {
  test.describe('Visual', () => {
    test('Should render basic view correctly', async ({ page }) => {
      await componentStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all variants correctly', async ({ page }) => {
      await componentStory.goto(page, 'Variants');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should become active when clicked', async ({ page }) => {
      await componentStory.goto(page, 'Basic');

      const component = page.getByTestId('component-name');
      await component.click();

      await expect(component).toHaveAttribute('data-state', 'active');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via Tab key', async ({ page }) => {
      await componentStory.goto(page, 'Basic');

      await page.keyboard.press('Tab');

      await expect(page.getByTestId('component-name')).toBeFocused();
    });
  });
});
```

The `createStoryHelper` ID format is `category-componentname` (lowercase, hyphen-separated), matching the Storybook `title` field. Pass the `data-testid` the test uses in the story (`<ComponentName data-testid='component-name' />`).

## Step 10: Write Unit Tests (for logic)

If the component has utility functions, hooks, or complex logic — add unit tests:

```ts
// lib/helpers.test.ts
import { describe, expect, it } from '@rstest/core';
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
- [ ] `data-slot` is set on the root (and on each sub-component root)
- [ ] `ref` forwarding works
- [ ] `...props` are spread on the root element
- [ ] Compound components cascade `data-testid` (`TestIdProvider` / `useTestId`)
- [ ] Interactive targets are analytics-ready ([new-component checklist](https://github.com/wallarm/design-system/blob/main/docs/metrics/new-component-checklist.md))
- [ ] `pnpm --filter @wallarm-org/design-system compiler:audit` lists no bailouts in the new component
- [ ] Barrel export (`index.ts`) is created
- [ ] Component is added to `src/index.ts`
- [ ] Storybook stories cover all variants and states
- [ ] E2E screenshot tests are written
- [ ] Accessibility is verified (ARIA, keyboard navigation)
- [ ] Design tokens used instead of hardcoded colors/sizes
- [ ] No `any` types in TypeScript
