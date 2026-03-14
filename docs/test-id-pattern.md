# Test ID Pattern — `data-testid` cascading for Playwright

## Problem

Compound components (Alert, Dialog, Card, etc.) render multiple DOM elements.
Playwright tests need stable selectors for both the root and inner parts.

Manually adding `data-testid` to each sub-component is repetitive and error-prone.

## Solution

A single `data-testid` on the root component automatically cascades to all sub-components via React context.

```tsx
<Alert data-testid="login-error">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>Invalid credentials</AlertDescription>
    <AlertControls>
      <Button>Retry</Button>
    </AlertControls>
  </AlertContent>
  <AlertClose onClick={onClose} />
</Alert>
```

### Generated DOM

```html
<div data-testid="login-error" role="alert">
  <div data-testid="login-error--icon">...</div>
  <div data-testid="login-error--content">
    <span data-testid="login-error--title">Error</span>
    <span data-testid="login-error--description">Invalid credentials</span>
    <div data-testid="login-error--controls">...</div>
  </div>
  <button data-testid="login-error--close">×</button>
</div>
```

### Playwright usage

```ts
// Root
await page.getByTestId('login-error').toBeVisible()

// Sub-elements
await page.getByTestId('login-error--title').toHaveText('Error')
await page.getByTestId('login-error--close').click()
await page.getByTestId('login-error--controls').locator('button').click()
```

## API

### `TestableProps`

Base interface that all root compound components must extend in their props type.

```tsx
import { type TestableProps } from '../../utils/testId'

export interface AlertProps extends ..., TestableProps { }
// or for type aliases:
export type TagProps = ... & TestableProps
```

This ensures `data-testid` can be destructured from props without TypeScript errors during declaration file generation (`rslib build`).

### `TestIdProvider`

React context provider. Root components wrap their children with it.

```tsx
import { TestIdProvider } from '../../utils/testId'

<TestIdProvider value={testId}>
  {children}
</TestIdProvider>
```

### `useTestId(slot: string): string | undefined`

Hook for sub-components. Returns `{baseTestId}--{slot}` or `undefined` if no provider exists.

```tsx
import { useTestId } from '../../utils/testId'

const testId = useTestId('close') // "login-error--close" or undefined
```

## Naming convention

Slot name = sub-component suffix in kebab-case, without the parent prefix.

| Sub-component    | Slot name     | Example result                |
|------------------|---------------|-------------------------------|
| `AlertClose`     | `close`       | `login-error--close`          |
| `AlertIcon`      | `icon`        | `login-error--icon`           |
| `DialogHeader`   | `header`      | `confirm-dialog--header`      |
| `DialogFooterControls` | `footer-controls` | `confirm-dialog--footer-controls` |
| `SelectSearchInput` | `search-input` | `country-select--search-input` |

## When `data-testid` is not passed

When no `data-testid` is provided to the root component, all derived test IDs are `undefined` — nothing is rendered to the DOM. This keeps production HTML clean unless explicitly opted-in.

```tsx
<Alert>  {/* no data-testid */}
  <AlertClose />  {/* no data-testid in DOM */}
</Alert>
```

## `data-testid` vs `data-slot`

| Attribute       | Purpose         | Set by         | When present     |
|-----------------|-----------------|----------------|------------------|
| `data-slot`     | CSS selectors   | Always on root | Always           |
| `data-testid`   | Test selectors  | Via context    | Only when passed |

These serve different purposes and coexist on the same elements.

## How testId is sourced

All compound components support `data-testid` cascading. Most receive it via the standard `data-testid` HTML attribute. Exceptions:

| Component | Source | Why |
|-----------|--------|-----|
| Toast | `toast.id` (automatic) | Data-driven, no JSX props |
| Tour | `testId` prop | No standard DOM root element |

## Adding TestId to a new compound component

1. Root component: extend props type with `TestableProps`
2. Root component: destructure `'data-testid': testId` from props
3. Root component: add `data-testid={testId}` to root element
4. Root component: wrap children in `<TestIdProvider value={testId}>`
5. Each sub-component: call `const testId = useTestId('slot-name')`
6. Each sub-component: add `data-testid={testId}` to its root element

See `.claude/rules/test-id.md` for the full checklist.
