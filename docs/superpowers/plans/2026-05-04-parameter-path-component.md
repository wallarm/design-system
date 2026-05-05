# ParameterPath Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `ParameterPath` component (WDS-107) — a horizontal chain "HTTP method → path segments → encoding" with auto-collapsed middle when the container overflows and a custom Cmd+C handler that emits a FilterInput-compatible expression.

**Architecture:**

- A single public component with a prop API (`method`, `segments`, `encoding`, `attack`, `copyFormat`). Internally it composes private sub-components (`Joint`, `Segment`, `Encoding`, `Ellipsis`, `Method`) for readability and `data-slot` markup.
- Truncation = a dedicated `ResizeObserver`-based hook: an off-screen measurement of every segment at full width, then "first + … + last" selection on overflow. Method and encoding are never collapsed.
- Copy = an `oncopy` listener on the root that overrides `clipboardData` with a FilterInput-formatted string. The default serializer ships in this package and can be overridden via `copyFormat`.
- A tooltip with the full path is shown only when the row is truncated; it wraps the root.

**Tech Stack:** React 19 + strict TypeScript, Tailwind, CVA, existing components `Badge`, `Tooltip`, icons `ChevronRight`, `Ellipsis` (as `…`), `Zap`. The `useContainerWidth` hook (already in `Table/lib`) is reused.

---

## File Structure

Create files under `packages/design-system/src/components/ParameterPath/`:

| File | Responsibility |
|------|----------------|
| `ParameterPath.tsx` | Root component. Orchestrates measurement, truncation, copy handler, tooltip wrapping. |
| `ParameterPathMethod.tsx` | Internal `Badge` render for the HTTP method. |
| `ParameterPathSegment.tsx` | Path segment. Variants: `default`, `highlighted`. Optional `Zap` icon. |
| `ParameterPathEncoding.tsx` | Trailing dashed pill in mono font. |
| `ParameterPathJoint.tsx` | `ChevronRight` separator. |
| `ParameterPathEllipsis.tsx` | `…` for collapsed segments. |
| `classes.ts` | CVA variants for `Segment` and `Encoding`. |
| `constants.ts` | `HttpMethod → BadgeColor` mapping, list of methods. |
| `types.ts` | `HttpMethod`, `ParameterPathProps`, `CopyFormatData`. |
| `useParameterPathTruncation.ts` | Hook: measures segments, returns `visibleIndices` + `isTruncated`. |
| `formatAsFilter.ts` | Default Cmd+C serializer. |
| `index.ts` | Exports `ParameterPath` + types. |
| `ParameterPath.stories.tsx` | Storybook: 6 stories per Figma + `Playground`. |
| `ParameterPath.e2e.ts` | Playwright: screenshots, interactions, a11y. |

---

## Public API

```tsx
import type { HTMLAttributes, Ref } from 'react'
import type { TestableProps } from '../../utils/testId'

export type HttpMethod =
  | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface CopyFormatData {
  method?: HttpMethod
  segments: string[]
  encoding?: string
}

export interface ParameterPathProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onCopy'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>
  /** HTTP method. When omitted the method section is not rendered. */
  method?: HttpMethod
  /** Path segments. The last segment is terminal (highlighted). */
  segments: string[]
  /** Trailing encoding marker (BASE64, URL, HEX, …). */
  encoding?: string
  /** When true, a Zap icon is shown on the terminal segment. */
  attack?: boolean
  /**
   * Cmd+C serializer. Receives the original (un-truncated) path data and
   * returns a string suitable for pasting into FilterInput.
   * Default: `formatAsFilter` from this package.
   */
  copyFormat?: (data: CopyFormatData) => string
}
```

**Example:**

```tsx
<ParameterPath
  method='POST'
  segments={['JSON', 'nginx_config']}
  encoding='BASE64'
  attack
/>
```

---

## Truncation algorithm

Input: a list of "measurable elements" in render order: `[Method?, Joint?, Segment_0, Joint, Segment_1, …, Segment_N-1, Joint?, Encoding?]` (joints sit between every pair of neighbours).

Algorithm (executed inside `useParameterPathTruncation`):

1. On the first pass render every element inside a hidden DOM node and measure each width via `getBoundingClientRect`.
2. Read `containerWidth` via `useContainerWidth`.
3. Sum of all widths ≤ `containerWidth` → `isTruncated = false`, `visibleIndices = [0..N-1]`.
4. Otherwise → `isTruncated = true`. `Method` and `Encoding` always stay visible. From `segments` we keep `segments[0]` + `…` + `segments[N-1]`. (When `N <= 2` truncation is meaningless — render as is.)
5. If even the collapsed version doesn't fit — render anyway; the outer `overflow-hidden` will clip the right edge (this case is covered by the "narrow container" screenshot test).

The full-path tooltip (`segments.join(' > ')` + encoding) is shown ONLY when `isTruncated === true`.

---

## Copy behaviour

We subscribe to `onCopy` on the root `<div>`. If the user's selection intersects our subtree we call `event.preventDefault()` and write the string returned by `copyFormat({ method, segments, encoding })` into `event.clipboardData`.

Default `formatAsFilter` (in `formatAsFilter.ts`):

```ts
export const formatAsFilter = ({ method, segments, encoding }: CopyFormatData): string => {
  const parts: string[] = []
  if (method) parts.push(`method = "${method}"`)
  if (segments.length > 0) parts.push(`parameter = "${segments.join('.')}"`)
  if (encoding) parts.push(`encoding = "${encoding}"`)
  return parts.join(' AND ')
}
```

> This format is a sensible default for FilterInput (the `field = "value"` syntax is compatible with the `parseExpression` grammar — operator `=`, not `==`). Platform consumers can override it via `copyFormat` if their fields are named differently.

---

## Tasks

### Task 1: Scaffold and types

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/types.ts`
- Create: `packages/design-system/src/components/ParameterPath/constants.ts`
- Create: `packages/design-system/src/components/ParameterPath/index.ts`

- [ ] **Step 1: Create `types.ts`**

```ts
// packages/design-system/src/components/ParameterPath/types.ts
import type { HTMLAttributes, Ref } from 'react'
import type { TestableProps } from '../../utils/testId'

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

export interface CopyFormatData {
  method?: HttpMethod
  segments: string[]
  encoding?: string
}

export interface ParameterPathProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onCopy'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>
  method?: HttpMethod
  segments: string[]
  encoding?: string
  attack?: boolean
  copyFormat?: (data: CopyFormatData) => string
}
```

- [ ] **Step 2: Create `constants.ts` mapping methods to `Badge` colours**

```ts
// packages/design-system/src/components/ParameterPath/constants.ts
import type { BadgeColor } from '../Badge'
import type { HttpMethod } from './types'

export const HTTP_METHOD_COLOR: Record<HttpMethod, BadgeColor> = {
  GET: 'green',
  POST: 'yellow',
  PUT: 'blue',
  PATCH: 'cyan',
  DELETE: 'red',
  HEAD: 'slate',
  OPTIONS: 'violet',
}
```

- [ ] **Step 3: Stub `index.ts`**

```ts
// packages/design-system/src/components/ParameterPath/index.ts
export type { HttpMethod, ParameterPathProps, CopyFormatData } from './types'
```

- [ ] **Step 4: Run typecheck — must pass**

```bash
cd packages/design-system && pnpm typecheck
```

Expected: success (no errors).

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/
git commit -m "feat(parameter-path): scaffold WDS-107 component types and constants"
```

---

### Task 2: `formatAsFilter` (default copy serializer)

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/formatAsFilter.ts`
- Test: `packages/design-system/src/components/ParameterPath/__tests__/formatAsFilter.test.ts`

- [ ] **Step 1: Write a failing test**

```ts
// packages/design-system/src/components/ParameterPath/__tests__/formatAsFilter.test.ts
import { describe, it, expect } from 'vitest'
import { formatAsFilter } from '../formatAsFilter'

describe('formatAsFilter', () => {
  it('emits all three clauses when method, segments, encoding are present', () => {
    expect(
      formatAsFilter({
        method: 'POST',
        segments: ['JSON', 'nginx_config'],
        encoding: 'BASE64',
      }),
    ).toBe('method = "POST" AND parameter = "JSON.nginx_config" AND encoding = "BASE64"')
  })

  it('skips method when omitted (e.g. SOAP/MCP)', () => {
    expect(formatAsFilter({ segments: ['cookie', 'session_id'] })).toBe(
      'parameter = "cookie.session_id"',
    )
  })

  it('skips encoding clause when not present', () => {
    expect(formatAsFilter({ method: 'GET', segments: ['query', 'filter'] })).toBe(
      'method = "GET" AND parameter = "query.filter"',
    )
  })

  it('returns empty string when there is nothing to serialize', () => {
    expect(formatAsFilter({ segments: [] })).toBe('')
  })
})
```

- [ ] **Step 2: Run — fails because the module is missing**

```bash
cd packages/design-system && pnpm vitest run src/components/ParameterPath/__tests__/formatAsFilter.test.ts
```

Expected: FAIL — `Cannot find module '../formatAsFilter'`.

- [ ] **Step 3: Implement `formatAsFilter.ts`**

```ts
// packages/design-system/src/components/ParameterPath/formatAsFilter.ts
import type { CopyFormatData } from './types'

/**
 * Default Cmd+C serializer. Produces a FilterInput-compatible expression:
 * `method = "POST" AND parameter = "a.b" AND encoding = "BASE64"`.
 *
 * Override via `copyFormat` prop if the consuming platform uses different field names.
 *
 * Note: values are not escaped — callers must ensure that `method`, `segments`,
 * and `encoding` do not contain unescaped double quotes. This matches the
 * FilterInput grammar's existing limitation around quoted identifiers.
 */
export const formatAsFilter = ({ method, segments, encoding }: CopyFormatData): string => {
  const parts: string[] = []
  if (method) parts.push(`method = "${method}"`)
  if (segments.length > 0) parts.push(`parameter = "${segments.join('.')}"`)
  if (encoding) parts.push(`encoding = "${encoding}"`)
  return parts.join(' AND ')
}
```

- [ ] **Step 4: Test passes**

```bash
cd packages/design-system && pnpm vitest run src/components/ParameterPath/__tests__/formatAsFilter.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/formatAsFilter.ts \
        packages/design-system/src/components/ParameterPath/__tests__/formatAsFilter.test.ts
git commit -m "feat(parameter-path): add default filter-format clipboard serializer"
```

---

### Task 3: CVA classes for segments and encoding

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/classes.ts`

- [ ] **Step 1: Create `classes.ts`**

```ts
// packages/design-system/src/components/ParameterPath/classes.ts
import { cva } from 'class-variance-authority'

export const segmentVariants = cva(
  'flex items-center justify-center gap-2 shrink-0 text-sm leading-5 whitespace-nowrap font-sans',
  {
    variants: {
      variant: {
        default: 'text-text-secondary font-normal',
        highlighted: 'text-text-primary font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export const encodingVariants = cva([
  'flex items-center justify-center shrink-0 gap-2',
  'rounded-8 border-1 border-dashed border-border-primary',
  'px-4 py-2',
  'font-mono text-xs leading-4 text-text-secondary',
])

export const jointVariants = cva('flex items-center shrink-0 p-2 text-icon-secondary')

export const ellipsisVariants = cva([
  'flex items-center justify-center shrink-0',
  'min-h-5 px-2 gap-2',
  'text-text-secondary',
])
```

- [ ] **Step 2: Run typecheck**

```bash
cd packages/design-system && pnpm typecheck
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/classes.ts
git commit -m "feat(parameter-path): add CVA variants for segments, encoding, joint"
```

---

### Task 4: Sub-component `ParameterPathJoint`

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/ParameterPathJoint.tsx`

- [ ] **Step 1: Implement**

```tsx
// packages/design-system/src/components/ParameterPath/ParameterPathJoint.tsx
import type { FC } from 'react'
import { ChevronRight } from '../../icons'
import { cn } from '../../utils/cn'
import { jointVariants } from './classes'

interface ParameterPathJointProps {
  className?: string
}

export const ParameterPathJoint: FC<ParameterPathJointProps> = ({ className }) => (
  <span aria-hidden='true' data-slot='parameter-path-joint' className={cn(jointVariants(), className)}>
    <ChevronRight size='sm' />
  </span>
)

ParameterPathJoint.displayName = 'ParameterPathJoint'
```

- [ ] **Step 2: typecheck**

```bash
cd packages/design-system && pnpm typecheck
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/ParameterPathJoint.tsx
git commit -m "feat(parameter-path): add joint (chevron separator) sub-component"
```

---

### Task 5: Sub-component `ParameterPathSegment`

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/ParameterPathSegment.tsx`

- [ ] **Step 1: Implement**

```tsx
// packages/design-system/src/components/ParameterPath/ParameterPathSegment.tsx
import type { FC } from 'react'
import { Zap } from '../../icons'
import { cn } from '../../utils/cn'
import { segmentVariants } from './classes'

interface ParameterPathSegmentProps {
  /** Segment text. */
  children: string
  /** `default` for intermediate segments, `highlighted` for the terminal one. */
  variant?: 'default' | 'highlighted'
  /** Show the Zap icon (only on highlighted, in the attack context). */
  withZap?: boolean
  className?: string
}

export const ParameterPathSegment: FC<ParameterPathSegmentProps> = ({
  children,
  variant = 'default',
  withZap = false,
  className,
}) => (
  <span
    data-slot='parameter-path-segment'
    data-variant={variant}
    className={cn(segmentVariants({ variant }), className)}
  >
    {children}
    {withZap && variant === 'highlighted' ? (
      <Zap size='sm' className='size-3 text-icon-warning' aria-hidden='true' />
    ) : null}
  </span>
)

ParameterPathSegment.displayName = 'ParameterPathSegment'
```

- [ ] **Step 2: typecheck**

```bash
cd packages/design-system && pnpm typecheck
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/ParameterPathSegment.tsx
git commit -m "feat(parameter-path): add segment sub-component with default/highlighted variants"
```

---

### Task 6: Sub-component `ParameterPathEncoding`

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/ParameterPathEncoding.tsx`

- [ ] **Step 1: Implement**

```tsx
// packages/design-system/src/components/ParameterPath/ParameterPathEncoding.tsx
import type { FC } from 'react'
import { cn } from '../../utils/cn'
import { encodingVariants } from './classes'

interface ParameterPathEncodingProps {
  children: string
  className?: string
}

export const ParameterPathEncoding: FC<ParameterPathEncodingProps> = ({
  children,
  className,
}) => (
  <span data-slot='parameter-path-encoding' className={cn(encodingVariants(), className)}>
    {children}
  </span>
)

ParameterPathEncoding.displayName = 'ParameterPathEncoding'
```

- [ ] **Step 2: typecheck**

```bash
cd packages/design-system && pnpm typecheck
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/ParameterPathEncoding.tsx
git commit -m "feat(parameter-path): add encoding tail sub-component"
```

---

### Task 7: Sub-components `ParameterPathEllipsis` and `ParameterPathMethod`

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/ParameterPathEllipsis.tsx`
- Create: `packages/design-system/src/components/ParameterPath/ParameterPathMethod.tsx`

- [ ] **Step 1: `ParameterPathEllipsis.tsx`**

```tsx
// packages/design-system/src/components/ParameterPath/ParameterPathEllipsis.tsx
import type { FC } from 'react'
import { Ellipsis } from '../../icons'
import { cn } from '../../utils/cn'
import { ellipsisVariants } from './classes'

interface ParameterPathEllipsisProps {
  className?: string
}

export const ParameterPathEllipsis: FC<ParameterPathEllipsisProps> = ({ className }) => (
  <span
    data-slot='parameter-path-ellipsis'
    aria-label='Collapsed segments'
    className={cn(ellipsisVariants(), className)}
  >
    <Ellipsis size='sm' />
  </span>
)

ParameterPathEllipsis.displayName = 'ParameterPathEllipsis'
```

- [ ] **Step 2: `ParameterPathMethod.tsx`**

```tsx
// packages/design-system/src/components/ParameterPath/ParameterPathMethod.tsx
import type { FC } from 'react'
import { Badge } from '../Badge'
import { HTTP_METHOD_COLOR } from './constants'
import type { HttpMethod } from './types'

interface ParameterPathMethodProps {
  method: HttpMethod
}

export const ParameterPathMethod: FC<ParameterPathMethodProps> = ({ method }) => (
  <Badge
    data-slot='parameter-path-method'
    type='secondary'
    color={HTTP_METHOD_COLOR[method]}
    size='medium'
    textVariant='code'
  >
    {method}
  </Badge>
)

ParameterPathMethod.displayName = 'ParameterPathMethod'
```

- [ ] **Step 3: typecheck**

```bash
cd packages/design-system && pnpm typecheck
```

Expected: success.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/ParameterPathEllipsis.tsx \
        packages/design-system/src/components/ParameterPath/ParameterPathMethod.tsx
git commit -m "feat(parameter-path): add ellipsis and method sub-components"
```

---

### Task 8: `useParameterPathTruncation` hook

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/useParameterPathTruncation.ts`
- Test: `packages/design-system/src/components/ParameterPath/__tests__/useParameterPathTruncation.test.ts`

> Algorithm: input is an array of refs to measurement nodes plus `containerWidth`. Returns `{ isTruncated, visibleSegmentIndices }`. Logic: if the total width of all elements ≤ container width → no truncation. Otherwise keep `segments[0]` and `segments[N-1]`; the middle becomes `…`. When `segments.length <= 2` truncation is impossible.

- [ ] **Step 1: Failing test (pure-functional part of the algorithm)**

```ts
// packages/design-system/src/components/ParameterPath/__tests__/useParameterPathTruncation.test.ts
import { describe, it, expect } from 'vitest'
import { computeTruncation } from '../useParameterPathTruncation'

describe('computeTruncation', () => {
  it('keeps everything visible when total width fits', () => {
    expect(
      computeTruncation({
        containerWidth: 500,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [40, 60, 80],
        jointWidth: 16,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0, 1, 2] })
  })

  it('collapses middle segments when overflowing', () => {
    expect(
      computeTruncation({
        containerWidth: 200,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [40, 200, 200, 200, 80],
        jointWidth: 16,
      }),
    ).toEqual({ isTruncated: true, visibleSegmentIndices: [0, 4] })
  })

  it('does not truncate when there are only two segments (no middle to hide)', () => {
    expect(
      computeTruncation({
        containerWidth: 50,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [200, 200],
        jointWidth: 16,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0, 1] })
  })

  it('keeps method and encoding visible even when truncating', () => {
    const result = computeTruncation({
      containerWidth: 250,
      methodWidth: 50,
      encodingWidth: 80,
      segmentWidths: [40, 100, 100, 100, 60],
      jointWidth: 16,
    })
    expect(result.isTruncated).toBe(true)
    expect(result.visibleSegmentIndices).toEqual([0, 4])
  })

  it('returns single-segment array unchanged', () => {
    expect(
      computeTruncation({
        containerWidth: 30,
        methodWidth: 0,
        encodingWidth: 0,
        segmentWidths: [500],
        jointWidth: 16,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [0] })
  })

  it('handles empty segments array', () => {
    expect(
      computeTruncation({
        containerWidth: 100,
        methodWidth: 50,
        encodingWidth: 0,
        segmentWidths: [],
        jointWidth: 16,
      }),
    ).toEqual({ isTruncated: false, visibleSegmentIndices: [] })
  })
})
```

- [ ] **Step 2: Run — fails**

```bash
cd packages/design-system && pnpm vitest run src/components/ParameterPath/__tests__/useParameterPathTruncation.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `useParameterPathTruncation.ts`, exporting both the pure function and the hook**

```ts
// packages/design-system/src/components/ParameterPath/useParameterPathTruncation.ts
import { useLayoutEffect, useState, type RefObject } from 'react'
import { useContainerWidth } from '../Table/lib/useContainerWidth'

interface ComputeArgs {
  containerWidth: number
  methodWidth: number
  encodingWidth: number
  segmentWidths: number[]
  jointWidth: number
}

interface TruncationResult {
  isTruncated: boolean
  visibleSegmentIndices: number[]
}

export const computeTruncation = ({
  containerWidth,
  methodWidth,
  encodingWidth,
  segmentWidths,
  jointWidth,
}: ComputeArgs): TruncationResult => {
  const segCount = segmentWidths.length
  const allIndices = Array.from({ length: segCount }, (_, i) => i)

  if (segCount <= 2 || containerWidth <= 0) {
    return { isTruncated: false, visibleSegmentIndices: allIndices }
  }

  const jointsCount =
    (methodWidth > 0 ? 1 : 0) + Math.max(0, segCount - 1) + (encodingWidth > 0 ? 1 : 0)
  const totalWidth =
    methodWidth +
    encodingWidth +
    segmentWidths.reduce((acc, w) => acc + w, 0) +
    jointsCount * jointWidth

  if (totalWidth <= containerWidth) {
    return { isTruncated: false, visibleSegmentIndices: allIndices }
  }

  return { isTruncated: true, visibleSegmentIndices: [0, segCount - 1] }
}

interface UseTruncationArgs {
  containerRef: RefObject<HTMLElement | null>
  measurementRef: RefObject<HTMLElement | null>
  segmentCount: number
  hasMethod: boolean
  hasEncoding: boolean
}

/**
 * Measures rendered segments inside `measurementRef` (a hidden full-width clone),
 * watches `containerRef` width via ResizeObserver, and returns truncation state.
 */
export const useParameterPathTruncation = ({
  containerRef,
  measurementRef,
  segmentCount,
  hasMethod,
  hasEncoding,
}: UseTruncationArgs): TruncationResult => {
  const containerWidth = useContainerWidth(containerRef)
  const [result, setResult] = useState<TruncationResult>({
    isTruncated: false,
    visibleSegmentIndices: Array.from({ length: segmentCount }, (_, i) => i),
  })

  useLayoutEffect(() => {
    const root = measurementRef.current
    if (!root) return

    const methodEl = root.querySelector<HTMLElement>('[data-measure="method"]')
    const encodingEl = root.querySelector<HTMLElement>('[data-measure="encoding"]')
    const jointEl = root.querySelector<HTMLElement>('[data-measure="joint"]')
    const segmentEls = Array.from(
      root.querySelectorAll<HTMLElement>('[data-measure="segment"]'),
    )

    const segmentWidths = segmentEls.map(el => el.getBoundingClientRect().width)
    const methodWidth = hasMethod && methodEl ? methodEl.getBoundingClientRect().width : 0
    const encodingWidth =
      hasEncoding && encodingEl ? encodingEl.getBoundingClientRect().width : 0
    const jointWidth = jointEl ? jointEl.getBoundingClientRect().width : 0

    setResult(
      computeTruncation({
        containerWidth,
        methodWidth,
        encodingWidth,
        segmentWidths,
        jointWidth,
      }),
    )
  }, [containerWidth, segmentCount, hasMethod, hasEncoding, measurementRef])

  return result
}
```

- [ ] **Step 4: Tests pass**

```bash
cd packages/design-system && pnpm vitest run src/components/ParameterPath/__tests__/useParameterPathTruncation.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/useParameterPathTruncation.ts \
        packages/design-system/src/components/ParameterPath/__tests__/useParameterPathTruncation.test.ts
git commit -m "feat(parameter-path): add truncation algorithm and hook"
```

---

### Task 9: Root `ParameterPath.tsx` (render without truncation)

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/ParameterPath.tsx`
- Modify: `packages/design-system/src/components/ParameterPath/index.ts`
- Test: `packages/design-system/src/components/ParameterPath/__tests__/ParameterPath.test.tsx`

> At this step we assemble the component without truncation/copy logic: method + segments + encoding + an always-on full-path tooltip. Truncation is added in Task 10, copy in Task 11.

- [ ] **Step 1: Failing unit test (basic structure rendering)**

```tsx
// packages/design-system/src/components/ParameterPath/__tests__/ParameterPath.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ParameterPath } from '../ParameterPath'

describe('ParameterPath', () => {
  it('renders method, all segments and encoding in order', () => {
    const { container } = render(
      <ParameterPath
        method='POST'
        segments={['JSON', 'nginx_config']}
        encoding='BASE64'
        data-testid='pp'
      />,
    )

    expect(screen.getByTestId('pp')).toBeInTheDocument()
    expect(container.textContent).toContain('POST')
    expect(container.textContent).toContain('JSON')
    expect(container.textContent).toContain('nginx_config')
    expect(container.textContent).toContain('BASE64')
  })

  it('does not render method section when method is omitted (SOAP/MCP case)', () => {
    render(<ParameterPath segments={['cookie', 'session_id']} data-testid='pp' />)
    expect(screen.queryByText('POST')).not.toBeInTheDocument()
    expect(screen.queryByText('GET')).not.toBeInTheDocument()
    expect(screen.getByText('session_id')).toBeInTheDocument()
  })

  it('marks the last segment as highlighted', () => {
    render(<ParameterPath segments={['JSON', 'nginx_config']} data-testid='pp' />)
    const segments = screen.getAllByTestId(/pp--segment-/)
    expect(segments).toHaveLength(2)
    expect(segments.at(-1)).toHaveAttribute('data-variant', 'highlighted')
    expect(segments[0]).toHaveAttribute('data-variant', 'default')
  })

  it('shows zap icon on highlighted segment when attack=true', () => {
    const { container } = render(
      <ParameterPath segments={['JSON', 'nginx_config']} attack data-testid='pp' />,
    )
    expect(container.querySelector('[data-slot="parameter-path-segment"][data-variant="highlighted"] svg')).toBeTruthy()
  })

  it('skips encoding when not provided', () => {
    render(<ParameterPath method='GET' segments={['query', 'filter']} data-testid='pp' />)
    expect(screen.queryByText('BASE64')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — fails**

```bash
cd packages/design-system && pnpm vitest run src/components/ParameterPath/__tests__/ParameterPath.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `ParameterPath.tsx` (without truncation/copy — added in later tasks)**

```tsx
// packages/design-system/src/components/ParameterPath/ParameterPath.tsx
import type { FC } from 'react'
import { Fragment } from 'react'
import { cn } from '../../utils/cn'
import { TestIdProvider } from '../../utils/testId'
import { ParameterPathEncoding } from './ParameterPathEncoding'
import { ParameterPathJoint } from './ParameterPathJoint'
import { ParameterPathMethod } from './ParameterPathMethod'
import { ParameterPathSegment } from './ParameterPathSegment'
import type { ParameterPathProps } from './types'

export const ParameterPath: FC<ParameterPathProps> = ({
  ref,
  method,
  segments,
  encoding,
  attack = false,
  copyFormat: _copyFormat,
  className,
  'data-testid': testId,
  ...rest
}) => {
  const lastIndex = segments.length - 1

  return (
    <TestIdProvider value={testId}>
      <div
        {...rest}
        ref={ref}
        data-testid={testId}
        data-slot='parameter-path'
        className={cn('flex items-center gap-0 min-w-0', className)}
      >
        {method ? (
          <>
            <ParameterPathMethod method={method} />
            {segments.length > 0 ? <ParameterPathJoint /> : null}
          </>
        ) : null}

        {segments.map((value, index) => {
          const isLast = index === lastIndex
          return (
            <Fragment key={`${index}-${value}`}>
              <span data-testid={testId ? `${testId}--segment-${index}` : undefined}>
                <ParameterPathSegment
                  variant={isLast ? 'highlighted' : 'default'}
                  withZap={isLast && attack}
                >
                  {value}
                </ParameterPathSegment>
              </span>
              {!isLast ? <ParameterPathJoint /> : null}
            </Fragment>
          )
        })}

        {encoding ? (
          <>
            <ParameterPathJoint />
            <ParameterPathEncoding>{encoding}</ParameterPathEncoding>
          </>
        ) : null}
      </div>
    </TestIdProvider>
  )
}

ParameterPath.displayName = 'ParameterPath'
```

- [ ] **Step 4: Update `index.ts`**

```ts
// packages/design-system/src/components/ParameterPath/index.ts
export { ParameterPath } from './ParameterPath'
export { formatAsFilter } from './formatAsFilter'
export type { HttpMethod, ParameterPathProps, CopyFormatData } from './types'
```

- [ ] **Step 5: Register in the root `src/index.ts`**

Open `packages/design-system/src/index.ts`, find the alphabetical spot (after `OverflowTooltip`/before `Polymorphic`) and add:

```ts
export {
  ParameterPath,
  type ParameterPathProps,
  type HttpMethod,
  type CopyFormatData,
  formatAsFilter,
} from './components/ParameterPath'
```

- [ ] **Step 6: Tests pass**

```bash
cd packages/design-system && pnpm vitest run src/components/ParameterPath/
```

Expected: PASS, all previously added tests + 5 new ones.

- [ ] **Step 7: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/ packages/design-system/src/index.ts
git commit -m "feat(parameter-path): assemble root component without truncation"
```

---

### Task 10: Truncation in the root component

**Files:**
- Modify: `packages/design-system/src/components/ParameterPath/ParameterPath.tsx`
- Test: `packages/design-system/src/components/ParameterPath/__tests__/ParameterPath.test.tsx` (extend)

> Strategy: render a hidden "measurement" clone (full path, `position:absolute; visibility:hidden; pointer-events:none; left:-9999px`) with `data-measure` attributes on the root nodes. The `useParameterPathTruncation` hook gets refs and returns `{ isTruncated, visibleSegmentIndices }`. The visible row consumes those indices.

- [ ] **Step 1: Extend the test — structurally verify that `useParameterPathTruncation` is invoked and its state is consumed**

Append to `ParameterPath.test.tsx`:

```tsx
import { vi } from 'vitest'

vi.mock('../useParameterPathTruncation', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../useParameterPathTruncation')>()
  return {
    ...mod,
    useParameterPathTruncation: vi.fn(() => ({ isTruncated: false, visibleSegmentIndices: [] })),
  }
})

import { useParameterPathTruncation } from '../useParameterPathTruncation'

describe('ParameterPath truncation rendering', () => {
  it('renders ellipsis between first and last segment when isTruncated', () => {
    vi.mocked(useParameterPathTruncation).mockReturnValue({
      isTruncated: true,
      visibleSegmentIndices: [0, 5],
    })
    render(
      <ParameterPath
        method='POST'
        segments={['multipart', 'a', 'b', 'c', 'd', 'get']}
        attack
        data-testid='pp'
      />,
    )
    expect(screen.getByLabelText('Collapsed segments')).toBeInTheDocument()
    expect(screen.getByText('multipart')).toBeInTheDocument()
    expect(screen.getByText('get')).toBeInTheDocument()
    expect(screen.queryByText('a')).not.toBeInTheDocument()
  })

  it('renders all segments inline when not truncated', () => {
    vi.mocked(useParameterPathTruncation).mockReturnValue({
      isTruncated: false,
      visibleSegmentIndices: [0, 1, 2],
    })
    render(<ParameterPath segments={['a', 'b', 'c']} data-testid='pp' />)
    expect(screen.queryByLabelText('Collapsed segments')).not.toBeInTheDocument()
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(screen.getByText('c')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — fails**

```bash
cd packages/design-system && pnpm vitest run src/components/ParameterPath/__tests__/ParameterPath.test.tsx
```

Expected: FAIL — "Collapsed segments" not found / extra segments in DOM.

- [ ] **Step 3: Rewrite `ParameterPath.tsx` with two render "tracks": measurement (hidden, always full) and visible (driven by `visibleSegmentIndices`)**

```tsx
// packages/design-system/src/components/ParameterPath/ParameterPath.tsx
import type { FC, ReactNode } from 'react'
import { Fragment, useRef } from 'react'
import { cn } from '../../utils/cn'
import { TestIdProvider } from '../../utils/testId'
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip'
import { ParameterPathEllipsis } from './ParameterPathEllipsis'
import { ParameterPathEncoding } from './ParameterPathEncoding'
import { ParameterPathJoint } from './ParameterPathJoint'
import { ParameterPathMethod } from './ParameterPathMethod'
import { ParameterPathSegment } from './ParameterPathSegment'
import type { ParameterPathProps } from './types'
import { useParameterPathTruncation } from './useParameterPathTruncation'

const buildFullPathLabel = (
  method: ParameterPathProps['method'],
  segments: string[],
  encoding?: string,
): string => {
  const parts: string[] = []
  if (method) parts.push(method)
  parts.push(...segments)
  if (encoding) parts.push(encoding)
  return parts.join(' › ')
}

export const ParameterPath: FC<ParameterPathProps> = ({
  ref,
  method,
  segments,
  encoding,
  attack = false,
  copyFormat: _copyFormat,
  className,
  'data-testid': testId,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const measurementRef = useRef<HTMLDivElement>(null)

  const { isTruncated, visibleSegmentIndices } = useParameterPathTruncation({
    containerRef,
    measurementRef,
    segmentCount: segments.length,
    hasMethod: Boolean(method),
    hasEncoding: Boolean(encoding),
  })

  const lastIndex = segments.length - 1
  const indices = isTruncated && segments.length > 2 ? visibleSegmentIndices : null

  const renderSegmentRow = (forMeasurement: boolean): ReactNode => {
    const visibleIdx =
      forMeasurement || indices === null
        ? Array.from({ length: segments.length }, (_, i) => i)
        : indices

    const items: ReactNode[] = []

    if (method) {
      items.push(
        <span key='method' data-measure={forMeasurement ? 'method' : undefined}>
          <ParameterPathMethod method={method} />
        </span>,
      )
    }

    visibleIdx.forEach((segIndex, position) => {
      const value = segments[segIndex]
      if (value === undefined) return
      const isLast = segIndex === lastIndex
      const isFirstShown = position === 0

      const showJointBefore = !(isFirstShown && !method)
      if (showJointBefore) {
        items.push(
          <span key={`j-${segIndex}-pre`} data-measure={forMeasurement ? 'joint' : undefined}>
            <ParameterPathJoint />
          </span>,
        )
      }

      const isCollapsedBoundary =
        !forMeasurement && indices !== null && position === 0 && visibleIdx.length === 2

      items.push(
        <span
          key={`s-${segIndex}`}
          data-measure={forMeasurement ? 'segment' : undefined}
          data-testid={testId ? `${testId}--segment-${segIndex}` : undefined}
        >
          <ParameterPathSegment
            variant={isLast ? 'highlighted' : 'default'}
            withZap={isLast && attack}
          >
            {value}
          </ParameterPathSegment>
        </span>,
      )

      if (isCollapsedBoundary) {
        items.push(
          <span key='ellipsis-joint-pre'>
            <ParameterPathJoint />
          </span>,
          <span key='ellipsis'>
            <ParameterPathEllipsis />
          </span>,
        )
      }
    })

    if (encoding) {
      items.push(
        <span key='enc-joint' data-measure={forMeasurement ? 'joint' : undefined}>
          <ParameterPathJoint />
        </span>,
        <span key='enc' data-measure={forMeasurement ? 'encoding' : undefined}>
          <ParameterPathEncoding>{encoding}</ParameterPathEncoding>
        </span>,
      )
    }

    return items
  }

  const visibleRow = (
    <div ref={containerRef} className='flex items-center gap-0 min-w-0 overflow-hidden'>
      {renderSegmentRow(false)}
    </div>
  )

  const measurementRow = (
    <div
      ref={measurementRef}
      aria-hidden='true'
      className='flex items-center gap-0 absolute left-[-9999px] top-0 invisible pointer-events-none'
    >
      {renderSegmentRow(true)}
    </div>
  )

  const root = (
    <TestIdProvider value={testId}>
      <div
        {...rest}
        data-testid={testId}
        data-slot='parameter-path'
        data-truncated={isTruncated || undefined}
        ref={ref}
        className={cn('relative flex items-center min-w-0', className)}
      >
        {visibleRow}
        {measurementRow}
      </div>
    </TestIdProvider>
  )

  if (!isTruncated) return root

  return (
    <Tooltip>
      <TooltipTrigger asChild>{root}</TooltipTrigger>
      <TooltipContent>{buildFullPathLabel(method, segments, encoding)}</TooltipContent>
    </Tooltip>
  )
}

ParameterPath.displayName = 'ParameterPath'
```

- [ ] **Step 4: Tests pass**

```bash
cd packages/design-system && pnpm vitest run src/components/ParameterPath/
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/
git commit -m "feat(parameter-path): wire ResizeObserver truncation with tooltip fallback"
```

---

### Task 11: Cmd+C → filter format

**Files:**
- Modify: `packages/design-system/src/components/ParameterPath/ParameterPath.tsx`
- Test: `packages/design-system/src/components/ParameterPath/__tests__/ParameterPath.test.tsx` (extend)

- [ ] **Step 1: Failing copy test**

```tsx
describe('ParameterPath copy', () => {
  it('overrides clipboard text with formatAsFilter on copy event', () => {
    const { container } = render(
      <ParameterPath
        method='POST'
        segments={['JSON', 'nginx_config']}
        encoding='BASE64'
        data-testid='pp'
      />,
    )

    const setData = vi.fn()
    const event = new Event('copy', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: { setData }, writable: false })

    container.querySelector('[data-slot="parameter-path"]')!.dispatchEvent(event)

    expect(setData).toHaveBeenCalledWith(
      'text/plain',
      'method = "POST" AND parameter = "JSON.nginx_config" AND encoding = "BASE64"',
    )
    expect(event.defaultPrevented).toBe(true)
  })

  it('uses custom copyFormat callback when provided', () => {
    const copyFormat = vi.fn(() => 'CUSTOM')
    const { container } = render(
      <ParameterPath
        method='GET'
        segments={['query', 'filter']}
        copyFormat={copyFormat}
        data-testid='pp'
      />,
    )
    const setData = vi.fn()
    const event = new Event('copy', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: { setData }, writable: false })
    container.querySelector('[data-slot="parameter-path"]')!.dispatchEvent(event)

    expect(copyFormat).toHaveBeenCalledWith({
      method: 'GET',
      segments: ['query', 'filter'],
      encoding: undefined,
    })
    expect(setData).toHaveBeenCalledWith('text/plain', 'CUSTOM')
  })
})
```

- [ ] **Step 2: Run — fails**

```bash
cd packages/design-system && pnpm vitest run src/components/ParameterPath/__tests__/ParameterPath.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Wire the `onCopy` handler on the root `<div>`**

In `ParameterPath.tsx` import `formatAsFilter`, add `useCallback`, and replace `copyFormat: _copyFormat` with the actual prop:

```tsx
import { useCallback, useRef } from 'react'
import { formatAsFilter } from './formatAsFilter'
// ...

export const ParameterPath: FC<ParameterPathProps> = ({
  // ...
  copyFormat = formatAsFilter,
  // ...
}) => {
  // ...

  const handleCopy = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const text = copyFormat({ method, segments, encoding })
      if (!text) return
      event.preventDefault()
      event.clipboardData.setData('text/plain', text)
    },
    [copyFormat, method, segments, encoding],
  )

  // ...
  // add onCopy={handleCopy} to the root div
}
```

(Drop the leading underscore on `copyFormat` since it is now used.)

- [ ] **Step 4: Tests pass**

```bash
cd packages/design-system && pnpm vitest run src/components/ParameterPath/
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/ParameterPath.tsx \
        packages/design-system/src/components/ParameterPath/__tests__/ParameterPath.test.tsx
git commit -m "feat(parameter-path): wire Cmd+C to filter-format clipboard payload"
```

---

### Task 12: Storybook stories

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/ParameterPath.stories.tsx`

- [ ] **Step 1: Build stories for the 6 Figma cases**

```tsx
// packages/design-system/src/components/ParameterPath/ParameterPath.stories.tsx
import type { Meta, StoryFn } from 'storybook-react-rsbuild'
import { VStack } from '../Stack'
import { ParameterPath } from './ParameterPath'
import type { HttpMethod } from './types'

const meta = {
  title: 'Data Display/ParameterPath',
  component: ParameterPath,
  parameters: { layout: 'centered' },
  argTypes: {
    method: {
      control: 'select',
      options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', undefined],
    },
    attack: { control: 'boolean' },
  },
} satisfies Meta<typeof ParameterPath>

export default meta

export const FullPath: StoryFn<typeof meta> = () => (
  <ParameterPath
    method='POST'
    segments={['JSON', 'nginx_config']}
    encoding='BASE64'
    attack
  />
)

export const NoEncoding: StoryFn<typeof meta> = () => (
  <ParameterPath method='GET' segments={['query', 'filter']} attack />
)

export const PathIndexBola: StoryFn<typeof meta> = () => (
  <ParameterPath method='GET' segments={['path', '2']} attack />
)

export const Header: StoryFn<typeof meta> = () => (
  <ParameterPath method='GET' segments={['header', 'X-Forwarded-For']} attack />
)

export const Cookie: StoryFn<typeof meta> = () => (
  <ParameterPath method='POST' segments={['cookie', 'session_id']} attack />
)

export const DeepNestedTruncated: StoryFn<typeof meta> = () => (
  <div style={{ width: 280 }}>
    <ParameterPath
      method='POST'
      segments={['multipart', 'json_abc', 'json_doc', 'qwerty_doc', 'hash', 'formData', 'get']}
      attack
    />
  </div>
)

export const NoMethod: StoryFn<typeof meta> = () => (
  <ParameterPath segments={['cookie', 'session_id']} attack />
)

export const Playground: StoryFn<typeof meta> = args => <ParameterPath {...args} />
Playground.args = {
  method: 'POST' satisfies HttpMethod,
  segments: ['JSON', 'nginx_config'],
  encoding: 'BASE64',
  attack: true,
}

export const Gallery: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <ParameterPath method='POST' segments={['JSON', 'nginx_config']} encoding='BASE64' attack />
    <ParameterPath method='GET' segments={['query', 'filter']} attack />
    <ParameterPath method='GET' segments={['path', '2']} attack />
    <ParameterPath method='GET' segments={['header', 'X-Forwarded-For']} attack />
    <ParameterPath method='POST' segments={['cookie', 'session_id']} attack />
    <div style={{ width: 280 }}>
      <ParameterPath
        method='POST'
        segments={['multipart', 'a', 'b', 'c', 'd', 'get']}
        attack
      />
    </div>
  </VStack>
)
```

- [ ] **Step 2: Start Storybook and verify visually**

```bash
cd packages/design-system && pnpm storybook
```

Expected: at `/?path=/story/data-display-parameterpath--gallery` all 6 cases render the way Figma shows them; the truncated variant displays `…` and a tooltip on hover.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/ParameterPath.stories.tsx
git commit -m "docs(parameter-path): add Storybook stories matching Figma"
```

---

### Task 13: E2E (screenshots, interactions, a11y)

**Files:**
- Create: `packages/design-system/src/components/ParameterPath/ParameterPath.e2e.ts`

> Before writing tests, read `docs/e2e-test-rules.md` and follow the naming/structure rules.

- [ ] **Step 1: Create the E2E spec**

```ts
// packages/design-system/src/components/ParameterPath/ParameterPath.e2e.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const story = (id: string) => `/iframe.html?id=data-display-parameterpath--${id}`

test.describe('ParameterPath', () => {
  test.describe('Screenshots', () => {
    test('full path with method, segments, encoding, attack', async ({ page }) => {
      await page.goto(story('full-path'))
      await expect(page.getByTestId('storybook-root')).toHaveScreenshot('full-path.png')
    })

    test('no encoding', async ({ page }) => {
      await page.goto(story('no-encoding'))
      await expect(page.getByTestId('storybook-root')).toHaveScreenshot('no-encoding.png')
    })

    test('path index BOLA', async ({ page }) => {
      await page.goto(story('path-index-bola'))
      await expect(page.getByTestId('storybook-root')).toHaveScreenshot('path-index-bola.png')
    })

    test('header', async ({ page }) => {
      await page.goto(story('header'))
      await expect(page.getByTestId('storybook-root')).toHaveScreenshot('header.png')
    })

    test('cookie', async ({ page }) => {
      await page.goto(story('cookie'))
      await expect(page.getByTestId('storybook-root')).toHaveScreenshot('cookie.png')
    })

    test('deep nested truncated', async ({ page }) => {
      await page.goto(story('deep-nested-truncated'))
      await expect(page.getByTestId('storybook-root')).toHaveScreenshot('truncated.png')
    })

    test('no method (SOAP/MCP)', async ({ page }) => {
      await page.goto(story('no-method'))
      await expect(page.getByTestId('storybook-root')).toHaveScreenshot('no-method.png')
    })
  })

  test.describe('Interactions', () => {
    test('shows full-path tooltip when truncated', async ({ page }) => {
      await page.goto(story('deep-nested-truncated'))
      await page.locator('[data-slot="parameter-path"]').hover()
      await expect(page.getByRole('tooltip')).toContainText('multipart')
      await expect(page.getByRole('tooltip')).toContainText('get')
    })

    test('does not show tooltip when not truncated', async ({ page }) => {
      await page.goto(story('full-path'))
      await page.locator('[data-slot="parameter-path"]').hover()
      await expect(page.getByRole('tooltip')).toHaveCount(0)
    })

    test('Cmd+C copies filter-format string', async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', 'clipboard read API limited in WebKit headless')
      await page.goto(story('full-path'))
      await page.locator('[data-slot="parameter-path"]').click()
      await page.keyboard.press('Control+A')
      await page.keyboard.press('Control+C')
      const clip = await page.evaluate(() => navigator.clipboard.readText())
      expect(clip).toBe(
        'method = "POST" AND parameter = "JSON.nginx_config" AND encoding = "BASE64"',
      )
    })
  })

  test.describe('Accessibility', () => {
    test('has no axe violations', async ({ page }) => {
      await page.goto(story('gallery'))
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  })
})
```

- [ ] **Step 2: Generate snapshots**

```bash
cd packages/design-system && pnpm test:e2e --update-snapshots src/components/ParameterPath/ParameterPath.e2e.ts
```

Expected: a `ParameterPath.e2e.ts-snapshots/` directory with PNG files is created.

- [ ] **Step 3: Re-run without `--update-snapshots` — must be green**

```bash
cd packages/design-system && pnpm test:e2e src/components/ParameterPath/ParameterPath.e2e.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/ParameterPath/ParameterPath.e2e.ts \
        packages/design-system/src/components/ParameterPath/ParameterPath.e2e.ts-snapshots/
git commit -m "test(parameter-path): add E2E coverage (screenshots, copy, tooltip, a11y)"
```

---

### Task 14: Final quality gate

- [ ] **Step 1: Lint + format**

```bash
npx biome check --write packages/design-system/src/components/ParameterPath/
```

Expected: no errors.

- [ ] **Step 2: Full typecheck + unit tests**

```bash
cd packages/design-system && pnpm typecheck && pnpm test
```

Expected: PASS.

- [ ] **Step 3: If biome auto-fixed anything, commit it**

```bash
git add -u packages/design-system/src/components/ParameterPath/
git diff --cached --quiet || git commit -m "style(parameter-path): biome formatting"
```

- [ ] **Step 4: Open a Pull Request**

```bash
gh pr create \
  --title "feat(parameter-path): WDS-107 ParameterPath component" \
  --body "$(cat <<'EOF'
## Summary
- New `ParameterPath` component for rendering "HTTP method → path → encoding" in attack/parameter contexts.
- Auto-truncation of the middle via `ResizeObserver` (first segment and the target are always visible), tooltip with the full path.
- Cmd+C copies a FilterInput-formatted string (override via `copyFormat`).

## Test plan
- [ ] `pnpm vitest run src/components/ParameterPath/`
- [ ] `pnpm test:e2e src/components/ParameterPath/ParameterPath.e2e.ts`
- [ ] Storybook: visually verify all 6 stories + Gallery; hover over truncated displays a tooltip
- [ ] Cmd+C pastes into FilterInput without parsing errors

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Open questions / future iterations

These items are NOT in scope for v1 — they came up in Slack but the user explicitly chose the simplified API:

1. **Decoders in the middle of the path.** Right now encoding is only the tail. If needed we can extend to `segments: Array<string | { kind: 'decoder', value: string }>` without breaking the existing API.
2. **Chained tail decoders** (`Base64 > Base64`, `Percent > HTMLJS`). Extending `encoding` to `string | string[]` is non-breaking.
3. **Progressive collapsing.** The current algorithm is binary (all fits / collapse middle). We could collapse step-by-step from the centre outward — but Figma only specifies the binary case.

---

## Self-Review

**1. Spec coverage:**
- HTTP method as Badge → Task 7 (`ParameterPathMethod`).
- Path segments with `>` separators → Tasks 4, 5, 9.
- Highlighted last segment + Zap → Tasks 5, 9.
- Encoding tail → Tasks 6, 9.
- Middle truncation on overflow + tooltip → Tasks 8, 10.
- Cmd+C → filter format → Tasks 2, 11.
- All Figma variants → Task 12 (Storybook).
- Skip http-method for SOAP/MCP → Task 9 (test `does not render method section`).

**2. Placeholder scan:** verified — every code block is filled, no `TODO/TBD/...later`, no "similar to Task N".

**3. Type consistency:**
- `HttpMethod` — single definition in `types.ts`, reused in `constants.ts` and the stories.
- `CopyFormatData` — exported from `types.ts`, used in `formatAsFilter` and the `copyFormat` prop.
- `ParameterPathProps` — single source for `index.ts` and `ParameterPath.tsx`.
- `computeTruncation` ↔ `useParameterPathTruncation` ↔ `ParameterPath.tsx` — all share the field name `visibleSegmentIndices`.
- `data-slot` values are consistent: `parameter-path`, `parameter-path-segment`, `parameter-path-method`, `parameter-path-encoding`, `parameter-path-joint`, `parameter-path-ellipsis`.
