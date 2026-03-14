# Test ID Pattern (data-testid cascading)

These rules apply when creating or modifying any compound component that has sub-components.

## Overview

`data-testid` cascades through compound components via React context.
`data-slot` is for CSS selectors only — never use it for testing.

## How It Works

1. **Root component** extracts `data-testid` from props and wraps `children` in `TestIdProvider`
2. **Sub-components** call `useTestId('slot-name')` to get a derived test ID
3. Format: `{baseTestId}--{slot}` (double dash separator)
4. If no `data-testid` is passed — all derived values are `undefined`, DOM stays clean

## Implementation Rules

### Root component (e.g. `Alert`)

```tsx
import { TestIdProvider } from '../../utils/testId'

export const Alert: FC<AlertProps> = ({
  'data-testid': testId,
  children,
  ...props
}) => {
  return (
    <div {...props} data-testid={testId}>
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </div>
  )
}
```

### Sub-component (e.g. `AlertClose`)

```tsx
import { useTestId } from '../../utils/testId'

export const AlertClose: FC<AlertCloseProps> = ({ ref, ...props }) => {
  const testId = useTestId('close')

  return <button {...props} ref={ref} data-testid={testId} />
}
```

## Slot Naming Convention

- Use the sub-component's role in **kebab-case**, without the parent prefix
- Examples: `close`, `icon`, `title`, `description`, `content`, `controls`, `trigger`, `header`, `footer`, `body`
- The slot name should match the sub-component suffix: `AlertClose` → `close`, `DialogHeader` → `header`

## When to Apply

- ✅ Compound components with 2+ sub-components (Alert, Dialog, Card, Field, Select, etc.)
- ✅ Components that render multiple interactive or semantically distinct DOM elements
- ❌ Simple leaf components (Button, Badge, Text) — they receive `data-testid` via `...rest` props spreading

## Checklist

When adding TestId support to a compound component:

1. [ ] Root component: destructure `'data-testid': testId` from props
2. [ ] Root component: pass `data-testid={testId}` to root element
3. [ ] Root component: wrap children with `<TestIdProvider value={testId}>`
4. [ ] Each sub-component: call `useTestId('slot-name')`
5. [ ] Each sub-component: pass `data-testid={testId}` to its root element
