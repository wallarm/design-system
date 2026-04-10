# SplitButton Component Design

## Overview

SplitButton is a visual wrapper that "attaches" exactly 2 buttons into a single group. Pattern: primary action + chevron button to open a dropdown menu with additional options.

The component does **not** manage the dropdown — that is the consumer's responsibility (via Popover, Menu, etc.).

**References:**
- [Figma](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8486-11155)
- [Chakra UI Group (attached)](https://chakra-ui.com/docs/components/group#attached)
- [ReUI ButtonGroup](https://reui.io/components/button-group)

## API

```tsx
interface SplitButtonProps extends ComponentPropsWithRef<'div'>, TestableProps {
  children: ReactNode  // exactly 2 Button elements
}
```

### Usage

```tsx
// Basic
<SplitButton>
  <Button variant="primary" color="brand" onClick={handleSave}>Save</Button>
  <Button variant="primary" color="brand"><ChevronDown /></Button>
</SplitButton>

// With Popover
<Popover>
  <SplitButton data-testid="save-split">
    <Button variant="primary" color="brand" onClick={handleSave}>Save</Button>
    <PopoverTrigger asChild>
      <Button variant="primary" color="brand"><ChevronDown /></Button>
    </PopoverTrigger>
  </SplitButton>
  <PopoverContent>...</PopoverContent>
</Popover>
```

### Rendered HTML

```html
<div role="group" data-slot="split-button" data-testid="save-split"
     class="inline-flex items-center gap-1">
  <!-- children -->
</div>
```

## Styles (CSS-only approach)

Always `gap-1` (1px) between buttons.

Border-radius is managed via `:first-child`/`:last-child` selectors on direct children:
- First child → `rounded-r-none` (remove right border-radius)
- Last child → `rounded-l-none` (remove left border-radius)

Note: ButtonBase does not have `data-slot="button"`, so we target children directly. `PopoverTrigger asChild` renders no wrapper element, so both buttons are always direct children.

```ts
// classes.ts
import { cva } from 'class-variance-authority'

export const splitButtonVariants = cva([
  'inline-flex items-center gap-1',
  '[&>:first-child]:rounded-r-none',
  '[&>:last-child]:rounded-l-none',
])
```

No CVA variants — a single base class.

## File Structure

```
packages/design-system/src/components/SplitButton/
  ├── index.ts              # re-export
  ├── SplitButton.tsx       # component (~25 lines)
  ├── classes.ts            # CVA classes
  ├── SplitButton.stories.tsx
  └── SplitButton.e2e.ts
```

Plus export from the root `packages/design-system/src/index.ts`.

## Component

```tsx
// SplitButton.tsx
import type { ComponentPropsWithRef, FC, ReactNode } from 'react'
import { type TestableProps, TestIdProvider } from '../../utils/testId'
import { cn } from '../../utils/cn'
import { splitButtonVariants } from './classes'

export interface SplitButtonProps extends ComponentPropsWithRef<'div'>, TestableProps {
  children: ReactNode
}

export const SplitButton: FC<SplitButtonProps> = ({
  'data-testid': testId,
  className,
  children,
  ref,
  ...props
}) => (
  <TestIdProvider value={testId}>
    <div
      {...props}
      ref={ref}
      role="group"
      data-slot="split-button"
      data-testid={testId}
      className={cn(splitButtonVariants(), className)}
    >
      {children}
    </div>
  </TestIdProvider>
)

SplitButton.displayName = 'SplitButton'
```

## Storybook Stories

1. **Default** — primary/brand, text + chevron
2. **Outline** — outline/neutral
3. **Secondary** — secondary/neutral
4. **Ghost** — ghost/neutral
5. **WithIcon** — icon + text in the primary button
6. **Sizes** — small, medium, large in one story
7. **WithPopover** — chevron wrapped in PopoverTrigger

## E2E Tests

### Screenshot tests
- Visual snapshots for each variant (variant x color)
- Sizes (small, medium, large)
- With icons

### Interaction tests
- Click on primary button and chevron button work independently

### Accessibility tests
- `role="group"` is present
- Keyboard navigation: Tab switches between buttons
