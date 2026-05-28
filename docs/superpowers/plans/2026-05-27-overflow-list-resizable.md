# OverflowList in resizable containers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `OverflowList` smooth when its container is resized (drawer, table cell) by removing DOM operations from the resize callback, and add demo stories + tests.

**Architecture:** The pure arithmetic of computing visible items is extracted into a separate testable function `calculateVisibleCount`. The `useOverflowItems` hook measures widths (including the `+N` indicator) once via a hidden measurement layer, caches them, and `ResizeObserver` (through `requestAnimationFrame`) only triggers a recompute from the cache. `OverflowList` drops the O(n²) `indexOf` and the `useMemo` side-effect.

**Tech Stack:** React 19, TypeScript (strict), Vitest + Testing Library (unit/component), Playwright (E2E), Storybook 10, Biome.

**Branch:** `feature/AS-1033` (already created, spec committed).

---

## File Structure

| File | Responsibility | Action |
|------|-----------------|----------|
| `packages/design-system/src/hooks/useOverflowItems.helpers.ts` | Pure function `calculateVisibleCount` — no DOM | Create |
| `packages/design-system/src/hooks/__tests__/useOverflowItems.helpers.test.ts` | Unit tests for the pure function | Create |
| `packages/design-system/src/hooks/useOverflowItems.tsx` | Measurement cache + rAF throttling of RO | Modify |
| `packages/design-system/src/components/OverflowList/OverflowList.tsx` | Index map instead of `indexOf`, `onOverflow` in `useEffect` | Modify |
| `packages/design-system/src/components/OverflowList/__tests__/OverflowList.test.tsx` | Component tests with a mocked hook | Create |
| `packages/design-system/src/components/OverflowList/OverflowList.stories.tsx` | Stories, including `ResizableContainer` | Create |
| `packages/design-system/src/components/OverflowList/OverflowList.e2e.ts` | E2E reflow on width change | Create |
| `packages/design-system/src/components/Drawer/Drawer.stories.tsx` | `ResizableWithOverflowList` story | Modify |
| `packages/design-system/src/components/Table/mocks.tsx` | Extend `tags` for a visible overflow | Modify |
| `packages/design-system/src/components/Table/Table.stories.tsx` | `ColumnResizingWithOverflowList` story | Modify |

> **Biome before every commit:** run `npx biome check --write <changed files>` and commit the formatted result (user preference).

---

## Task 1: Pure function `calculateVisibleCount` (TDD)

**Files:**
- Create: `packages/design-system/src/hooks/useOverflowItems.helpers.ts`
- Test: `packages/design-system/src/hooks/__tests__/useOverflowItems.helpers.test.ts`

- [ ] **Step 1: Write a failing test**

`packages/design-system/src/hooks/__tests__/useOverflowItems.helpers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { calculateVisibleCount } from '../useOverflowItems.helpers';

describe('calculateVisibleCount', () => {
  it('returns all items when everything fits without an indicator', () => {
    const count = calculateVisibleCount({
      itemWidths: [50, 50, 50],
      gap: 10,
      availableWidth: 1000,
      indicatorWidth: 40,
    });
    expect(count).toBe(3);
  });

  it('reserves indicator space and counts only what fits when overflowing', () => {
    // widths+gaps: 50, +10+50=110, +10+50=170; indicator 40 + gap 10 reserved.
    // availableWidth 130 → maxWidth 80 → fits item0 (50) and item1 (50+10=60 -> 110 > 80) => 1
    const count = calculateVisibleCount({
      itemWidths: [50, 50, 50],
      gap: 10,
      availableWidth: 130,
      indicatorWidth: 40,
    });
    expect(count).toBe(1);
  });

  it('always shows at least one item even if it does not fit', () => {
    const count = calculateVisibleCount({
      itemWidths: [500, 500],
      gap: 0,
      availableWidth: 100,
      indicatorWidth: 40,
    });
    expect(count).toBe(1);
  });

  it('returns all items when availableWidth is not measurable (<= 0)', () => {
    const count = calculateVisibleCount({
      itemWidths: [50, 50],
      gap: 0,
      availableWidth: 0,
      indicatorWidth: 40,
    });
    expect(count).toBe(2);
  });

  it('returns 0 for an empty list', () => {
    const count = calculateVisibleCount({
      itemWidths: [],
      gap: 8,
      availableWidth: 500,
      indicatorWidth: 40,
    });
    expect(count).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

Run: `pnpm --filter @wallarm-org/design-system test -- useOverflowItems.helpers`
Expected: FAIL — `calculateVisibleCount` is not defined / module not found.

- [ ] **Step 3: Implement the function**

`packages/design-system/src/hooks/useOverflowItems.helpers.ts`:

```ts
export interface CalculateVisibleCountParams {
  /** Width of each item in source order (px). */
  itemWidths: number[];
  /** Gap between the container's flex children (px). */
  gap: number;
  /** Available container width (px). */
  availableWidth: number;
  /** Measured width of the "+N" indicator (px); fallback — reserveSpace. */
  indicatorWidth: number;
}

/**
 * Pure arithmetic: how many leading items fit before an overflow indicator
 * is required. Does not touch the DOM — safe to call on every resize frame.
 */
export function calculateVisibleCount({
  itemWidths,
  gap,
  availableWidth,
  indicatorWidth,
}: CalculateVisibleCountParams): number {
  if (itemWidths.length === 0) return 0;
  if (availableWidth <= 0) return itemWidths.length;

  // First pass: does everything fit without an indicator?
  let total = 0;
  for (let i = 0; i < itemWidths.length; i++) {
    total += itemWidths[i] + (i > 0 ? gap : 0);
  }
  if (total <= availableWidth) return itemWidths.length;

  // Second pass: reserve space for the indicator, count what fits.
  const maxWidth = availableWidth - indicatorWidth - gap;
  let accumulated = 0;
  let count = 0;
  for (let i = 0; i < itemWidths.length; i++) {
    const widthWithGap = itemWidths[i] + (i > 0 ? gap : 0);
    if (accumulated + widthWithGap <= maxWidth || i === 0) {
      accumulated += widthWithGap;
      count++;
    } else {
      break;
    }
  }
  return Math.max(count, 1); // always show at least one
}
```

- [ ] **Step 4: Run the test — confirm it passes**

Run: `pnpm --filter @wallarm-org/design-system test -- useOverflowItems.helpers`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/hooks/useOverflowItems.helpers.ts packages/design-system/src/hooks/__tests__/useOverflowItems.helpers.test.ts
git add packages/design-system/src/hooks/useOverflowItems.helpers.ts packages/design-system/src/hooks/__tests__/useOverflowItems.helpers.test.ts
git commit -m "feat(overflow-list): AS-1033 pure calculateVisibleCount helper"
```

---

## Task 2: Refactor `useOverflowItems` to cache + rAF

**Files:**
- Modify: `packages/design-system/src/hooks/useOverflowItems.tsx` (full body replacement)

Goal: remove the `document.createElement` block and `getComputedStyle` from the resize path; measure widths (including the indicator) once; `ResizeObserver` (through `requestAnimationFrame`) only triggers a `recompute` from the cache.

- [ ] **Step 1: Replace the file contents**

`packages/design-system/src/hooks/useOverflowItems.tsx`:

```tsx
import {
  type ReactElement,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { calculateVisibleCount } from './useOverflowItems.helpers';

export interface UseOverflowItemsOptions<T> {
  items: T[];
  renderItem: (item: T) => ReactElement;
  renderMeasurementItem?: (item: T) => ReactElement;
  overflowRenderer?: (items: T[]) => ReactElement;
  reserveSpace?: number;
}

export interface UseOverflowItemsResult<T> {
  containerRef: RefObject<HTMLDivElement | null>;
  visibleItems: T[];
  hiddenItems: T[];
  visibleCount: number;
  hiddenCount: number;
  MeasurementContainer: () => ReactElement | null;
}

export function useOverflowItems<T>({
  items,
  renderItem,
  renderMeasurementItem,
  overflowRenderer,
  reserveSpace = 60,
}: UseOverflowItemsOptions<T>): UseOverflowItemsResult<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  // Hidden measurement layer: refs for each item + a ref for the "+N" indicator.
  const measurementRefs = useRef<(HTMLElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  // Measurement cache — read once when items/renderers change, not on a resize tick.
  const cacheRef = useRef<{ widths: number[]; gap: number; indicatorWidth: number }>({
    widths: [],
    gap: 0,
    indicatorWidth: reserveSpace,
  });

  // Pure recompute from the cache + current container width. No DOM writes.
  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { widths, gap, indicatorWidth } = cacheRef.current;
    if (widths.length === 0) {
      setVisibleCount(prev => (prev === items.length ? prev : items.length));
      return;
    }

    const next = calculateVisibleCount({
      itemWidths: widths,
      gap,
      availableWidth: container.offsetWidth,
      indicatorWidth,
    });
    setVisibleCount(prev => (prev === next ? prev : next));
  }, [items.length]);

  // Measure once when items/renderers change. DOM reads only.
  useLayoutEffect(() => {
    const container = containerRef.current;

    if (items.length === 0) {
      cacheRef.current = { widths: [], gap: 0, indicatorWidth: reserveSpace };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleCount(0);
      return;
    }

    const gap = container ? Number.parseFloat(getComputedStyle(container).gap || '0') || 0 : 0;
    const widths = measurementRefs.current
      .slice(0, items.length)
      .map(ref => ref?.offsetWidth ?? 0);
    const indicatorWidth = indicatorRef.current?.offsetWidth || reserveSpace;

    cacheRef.current = { widths, gap, indicatorWidth };
    recompute();
  }, [items, renderItem, renderMeasurementItem, overflowRenderer, reserveSpace, recompute]);

  // Observe container resize; defer the heavy work into rAF,
  // coalescing several frame notifications into one recompute.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        recompute();
      });
    });
    observer.observe(container);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [recompute]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);
  const hiddenCount = hiddenItems.length;

  // Stable measurement-layer component — not recreated on every render.
  const MeasurementContainer = useCallback(() => {
    if (items.length === 0) return null;

    const renderMeasure = renderMeasurementItem || renderItem;

    return (
      <div className='absolute invisible pointer-events-none' aria-hidden='true'>
        {items.map((item, index) => {
          const key = `${index}`;
          return (
            <div
              key={key}
              ref={el => {
                measurementRefs.current[index] = el;
              }}
              className='inline-flex'
            >
              {renderMeasure(item)}
            </div>
          );
        })}
        {overflowRenderer && (
          <div ref={indicatorRef} className='inline-flex'>
            {overflowRenderer(items)}
          </div>
        )}
      </div>
    );
  }, [items, renderItem, renderMeasurementItem, overflowRenderer]);

  return {
    containerRef,
    visibleItems,
    hiddenItems,
    visibleCount,
    hiddenCount,
    MeasurementContainer,
  };
}
```

- [ ] **Step 2: Check types and lint**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS — no type errors.

Run: `npx biome check packages/design-system/src/hooks/useOverflowItems.tsx`
Expected: no errors (formatting warnings will be fixed by `--write` below).

- [ ] **Step 3: Run the helper unit tests (regression)**

Run: `pnpm --filter @wallarm-org/design-system test -- useOverflowItems`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
npx biome check --write packages/design-system/src/hooks/useOverflowItems.tsx
git add packages/design-system/src/hooks/useOverflowItems.tsx
git commit -m "perf(overflow-list): AS-1033 cache measurements, rAF-throttle ResizeObserver"
```

---

## Task 3: Optimize `OverflowList` (index map + useEffect)

**Files:**
- Modify: `packages/design-system/src/components/OverflowList/OverflowList.tsx`

- [ ] **Step 1: Update the React imports**

Replace lines 1-8 (the `react` import):

```tsx
import {
  type HTMLAttributes,
  memo,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
```

- [ ] **Step 2: Replace the `indexOf` renderers with an index map (lines 36-51)**

Delete the `memoizedItemRenderer` + `memoizedMeasurementRenderer` block (current lines 36-51) and insert:

```tsx
  // Build the item → index map once: removes the O(n²) from indexOf in the renderer.
  const indexMap = useMemo(() => {
    const map = new Map<T, number>();
    items.forEach((item, index) => {
      if (!map.has(item)) map.set(item, index);
    });
    return map;
  }, [items]);

  const memoizedItemRenderer = useCallback(
    (item: T) => itemRenderer(item, indexMap.get(item) ?? 0),
    [indexMap, itemRenderer],
  );

  const memoizedMeasurementRenderer = useCallback(
    (item: T) => itemRenderer(item, indexMap.get(item) ?? 0) as ReactElement,
    [indexMap, itemRenderer],
  );
```

- [ ] **Step 3: Replace the `useMemo` side-effect for `onOverflow` (lines 77-82)**

Delete the block:

```tsx
  // Call onOverflow when hidden items change
  useMemo(() => {
    if (onOverflow && finalHiddenItems.length > 0) {
      onOverflow(finalHiddenItems);
    }
  }, [finalHiddenItems, onOverflow]);
```

And insert in its place:

```tsx
  // Report overflow as a side-effect, not during render.
  useEffect(() => {
    if (onOverflow && finalHiddenItems.length > 0) {
      onOverflow(finalHiddenItems);
    }
  }, [finalHiddenItems, onOverflow]);
```

- [ ] **Step 4: Check types**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/OverflowList/OverflowList.tsx
git add packages/design-system/src/components/OverflowList/OverflowList.tsx
git commit -m "perf(overflow-list): AS-1033 drop O(n^2) indexOf, move onOverflow to effect"
```

---

## Task 4: Component tests for `OverflowList` (TDD, mocked hook)

**Files:**
- Create: `packages/design-system/src/components/OverflowList/__tests__/OverflowList.test.tsx`

> In jsdom, `offsetWidth` = 0 and `ResizeObserver` is mocked as a no-op (see `vitest.setup.ts`), so the real computation cannot be reproduced. We mock `useOverflowItems`, as done in `ParameterPath.test.tsx`, and test the `OverflowList` logic itself.

- [ ] **Step 1: Write the failing tests**

`packages/design-system/src/components/OverflowList/__tests__/OverflowList.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { type ReactElement, useCallback } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../hooks', () => ({
  useOverflowItems: vi.fn(),
}));

import { useOverflowItems } from '../../../hooks';
import { OverflowList } from '../OverflowList';

type HookReturn = ReturnType<typeof useOverflowItems<string>>;

const mockHook = (visibleItems: string[], hiddenItems: string[]) => {
  const value: HookReturn = {
    containerRef: { current: null },
    visibleItems,
    hiddenItems,
    visibleCount: visibleItems.length,
    hiddenCount: hiddenItems.length,
    MeasurementContainer: () => null as unknown as ReactElement,
  };
  vi.mocked(useOverflowItems).mockReturnValue(value as never);
};

const items = ['a', 'b', 'c', 'd'];
const itemRenderer = (item: string) => <span key={item}>{item}</span>;
const overflowRenderer = (hidden: string[]) => <span>+{hidden.length}</span>;

describe('OverflowList', () => {
  beforeEach(() => {
    vi.mocked(useOverflowItems).mockReset();
  });

  it('renders visible items and the overflow indicator for hidden items', () => {
    mockHook(['a', 'b'], ['c', 'd']);
    render(
      <OverflowList items={items} itemRenderer={itemRenderer} overflowRenderer={overflowRenderer} />,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('does not render the overflow indicator when nothing is hidden', () => {
    mockHook(items, []);
    render(
      <OverflowList items={items} itemRenderer={itemRenderer} overflowRenderer={overflowRenderer} />,
    );
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('renders the overflow indicator when alwaysRenderOverflow is set even with 0 hidden', () => {
    mockHook(items, []);
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
        alwaysRenderOverflow
      />,
    );
    expect(screen.getByText('+0')).toBeInTheDocument();
  });

  it('passes the correct source index to itemRenderer', () => {
    mockHook(['c', 'd'], []);
    const indices: number[] = [];
    render(
      <OverflowList
        items={items}
        itemRenderer={(item, index) => {
          indices.push(index);
          return <span key={item}>{item}</span>;
        }}
        overflowRenderer={overflowRenderer}
      />,
    );
    // 'c' and 'd' are at indices 2 and 3 in the source array.
    expect(indices).toEqual([2, 3]);
  });

  it('calls onOverflow with hidden items', () => {
    mockHook(['a'], ['b', 'c', 'd']);
    const onOverflow = vi.fn();
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
        onOverflow={onOverflow}
      />,
    );
    expect(onOverflow).toHaveBeenCalledWith(['b', 'c', 'd']);
  });

  it('expands visible items up to minVisibleItems', () => {
    // The hook returned only 1 visible item, but minVisibleItems=3 → expect the first 3.
    mockHook(['a'], ['b', 'c', 'd']);
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
        minVisibleItems={3}
      />,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('c')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests — confirm they are green (the logic is already implemented in Task 3)**

Run: `pnpm --filter @wallarm-org/design-system test -- OverflowList.test`
Expected: PASS (6 tests). If the `minVisibleItems` test fails — that is a regression of the logic in lines 60-73 of `OverflowList.tsx`; recheck that the `finalVisibleItems`/`finalHiddenItems` block is preserved unchanged.

- [ ] **Step 3: Commit**

```bash
npx biome check --write packages/design-system/src/components/OverflowList/__tests__/OverflowList.test.tsx
git add packages/design-system/src/components/OverflowList/__tests__/OverflowList.test.tsx
git commit -m "test(overflow-list): AS-1033 component tests for overflow + min visible"
```

---

## Task 5: `OverflowList.stories.tsx` story

**Files:**
- Create: `packages/design-system/src/components/OverflowList/OverflowList.stories.tsx`

- [ ] **Step 1: Create the story file**

`packages/design-system/src/components/OverflowList/OverflowList.stories.tsx`:

```tsx
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tag } from '../Tag';
import { OverflowList } from './OverflowList';

const meta = {
  title: 'Data Display/OverflowList',
  component: OverflowList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders a horizontal list of items and collapses the ones that do not fit into a ' +
          '"+N" overflow indicator. Reflows efficiently when its container is resized.',
      },
    },
  },
} satisfies Meta<typeof OverflowList<string>>;

export default meta;

const TAGS = ['XSS', 'BOLA', 'SQL Injection', 'Scanner', 'CSRF', 'XXE', 'RCE', 'LFI', 'IDOR'];

const renderOverflowPopover = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/** Basic list — all items fit in a wide container. */
export const Basic: StoryFn = () => (
  <div className='w-640'>
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);

/** Narrow container — most items collapse into "+N". */
export const Collapsed: StoryFn = () => (
  <div className='w-200'>
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);

/** Collapse from the start of the list. */
export const CollapseFromStart: StoryFn = () => (
  <div className='w-240'>
    <OverflowList
      className='gap-4'
      collapseFrom='start'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);

/** Guaranteed minimum of visible items. */
export const MinVisibleItems: StoryFn = () => (
  <div className='w-160'>
    <OverflowList
      className='gap-4'
      minVisibleItems={3}
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);

/**
 * Resizable container: drag the bottom-right corner of the frame to see live
 * reflow. `data-testid` is used in E2E for programmatic resizing.
 */
export const ResizableContainer: StoryFn = () => (
  <div
    data-testid='resizable-wrapper'
    className='resize-x overflow-hidden rounded-2 border border-border-primary p-12'
    style={{ width: 500, minWidth: 80, maxWidth: 800 }}
  >
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);
```

> If the width Tailwind classes `w-640`/`w-200`/`w-240`/`w-160` are not in the config — replace them with inline `style={{ width: N }}`. Check their presence: `grep -R "w-640\|w-200" packages/design-system/src` or look for the classes in the Storybook build.

- [ ] **Step 2: Verify that Storybook builds the stories**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS.

Optionally by hand: `pnpm --filter @wallarm-org/design-system storybook` → open `Data Display/OverflowList/Resizable Container`, drag the frame corner, confirm smooth reflow without freezes.

- [ ] **Step 3: Commit**

```bash
npx biome check --write packages/design-system/src/components/OverflowList/OverflowList.stories.tsx
git add packages/design-system/src/components/OverflowList/OverflowList.stories.tsx
git commit -m "docs(overflow-list): AS-1033 stories incl. resizable container demo"
```

---

## Task 6: E2E `OverflowList.e2e.ts` (deterministic resize)

**Files:**
- Create: `packages/design-system/src/components/OverflowList/OverflowList.e2e.ts`

> Changing the wrapper's `style.width` via `evaluate` triggers `ResizeObserver` deterministically — independent of drag flakiness. Story id: `data-display-overflowlist` (Storybook slugifies the title `Data Display/OverflowList`).

- [ ] **Step 1: Write the E2E test**

`packages/design-system/src/components/OverflowList/OverflowList.e2e.ts`:

```ts
import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const overflowStory = createStoryHelper('data-display-overflowlist', [
  'Basic',
  'Collapsed',
  'Resizable Container',
] as const);

const setWrapperWidth = (page: Page, width: number) =>
  page
    .getByTestId('resizable-wrapper')
    .evaluate((el, w) => {
      (el as HTMLElement).style.width = `${w}px`;
    }, width);

// Visible tags are the items in the main container, except the "+N" popover trigger.
const getVisibleTagCount = (page: Page) =>
  page.locator('[data-slot="overflow-list"] [data-slot="tag"]').count();

test.describe('Component: OverflowList', () => {
  test.describe('Visual', () => {
    test('Should render the full list in a wide container correctly', async ({ page }) => {
      await overflowStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the collapsed list in a narrow container correctly', async ({ page }) => {
      await overflowStory.goto(page, 'Collapsed');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should collapse items into the overflow indicator when the container shrinks', async ({
      page,
    }) => {
      await overflowStory.goto(page, 'Resizable Container');
      const wide = await getVisibleTagCount(page);

      await setWrapperWidth(page, 120);
      await expect
        .poll(() => getVisibleTagCount(page))
        .toBeLessThan(wide);
      await expect(page.getByText(/^\+\d+$/)).toBeVisible();
    });

    test('Should restore items when the container grows back', async ({ page }) => {
      await overflowStory.goto(page, 'Resizable Container');

      await setWrapperWidth(page, 120);
      const narrow = await getVisibleTagCount(page);

      await setWrapperWidth(page, 760);
      await expect
        .poll(() => getVisibleTagCount(page))
        .toBeGreaterThan(narrow);
    });
  });
});
```

> Before running, confirm that `OverflowList`'s root `div` has `data-slot="overflow-list"` and that `Tag` has `data-slot="tag"`. If `OverflowList` has no slug (the current code does not — see `OverflowList.tsx:108`), add `data-slot='overflow-list'` to the root `div` in `OverflowList.tsx` as part of this task and commit it together. Check the `Tag` slug: `grep -n "data-slot" packages/design-system/src/components/Tag/Tag.tsx`.

- [ ] **Step 2: If needed, add `data-slot` to `OverflowList.tsx`**

If the root `div` (line ~108) has no `data-slot`, replace:

```tsx
      <div ref={containerRef} className={cn('flex w-full min-w-0', className)} {...props}>
```
with:
```tsx
      <div
        ref={containerRef}
        data-slot='overflow-list'
        className={cn('flex w-full min-w-0', className)}
        {...props}
      >
```

Adjust the test locators to the real `data-slot` values (`Tag` may use a different slug — fix the `getVisibleTagCount` selector).

- [ ] **Step 3: Run E2E (requires a running Storybook)**

Run (locally): `pnpm --filter @wallarm-org/design-system test:e2e -- OverflowList`
Expected: PASS. On the first run of the visual tests, generate the snapshots (see README/CI: a commit with `[update-screenshots]` on main or a local `--update-snapshots`).

- [ ] **Step 4: Commit**

```bash
npx biome check --write packages/design-system/src/components/OverflowList/OverflowList.e2e.ts packages/design-system/src/components/OverflowList/OverflowList.tsx
git add packages/design-system/src/components/OverflowList/OverflowList.e2e.ts packages/design-system/src/components/OverflowList/OverflowList.tsx
git commit -m "test(overflow-list): AS-1033 e2e reflow on container resize"
```

---

## Task 7: `ResizableWithOverflowList` story in Drawer

**Files:**
- Modify: `packages/design-system/src/components/Drawer/Drawer.stories.tsx`

- [ ] **Step 1: Add imports to the top of the story file**

Add to the imports block in `Drawer.stories.tsx` (next to the existing component imports):

```tsx
import { Attribute, AttributeLabel, AttributeValue } from '../Attribute';
import { OverflowList } from '../OverflowList';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tag } from '../Tag';
```

> Check the exact paths/export names: `grep -n "export" packages/design-system/src/components/Attribute/index.ts`. If `Attribute*` is exported differently — fix the import.

- [ ] **Step 2: Add the story at the end of the file (before the close, after `Resizable`)**

```tsx
const DRAWER_TAGS = [
  'api-abuse',
  'account-takeover',
  'credential-stuffing',
  'XSS',
  'SQL Injection',
  'CSRF',
  'scanner',
  'brute-force',
  'data-exfiltration',
];

const renderDrawerOverflow = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/** Resizable drawer with an OverflowList — drag the left edge to reflow tags. */
export const ResizableWithOverflowList: StoryFn<DrawerProps> = () => (
  <Drawer defaultOpen>
    <DrawerTrigger asChild>
      <Button>Open Resizable Drawer with OverflowList</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerResizeHandle />
      <DrawerHeader>
        <DrawerTitle>Resizable Drawer with OverflowList</DrawerTitle>
      </DrawerHeader>
      <DrawerBody>
        <p className='mb-16'>Drag the left edge — the tag list reflows live.</p>
        <Attribute>
          <AttributeLabel>Attack types</AttributeLabel>
          <AttributeValue>
            <OverflowList
              className='gap-4'
              items={DRAWER_TAGS}
              itemRenderer={item => <Tag key={item}>{item}</Tag>}
              overflowRenderer={renderDrawerOverflow}
            />
          </AttributeValue>
        </Attribute>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);
```

> Check the `Drawer` API: does it support `defaultOpen`. If not — use controlled state via `useState`, like in the existing stories (`open`/`onOpenChange`). Cross-check with the already written `Resizable` story in this file and reuse its open pattern.

- [ ] **Step 3: Check types**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
npx biome check --write packages/design-system/src/components/Drawer/Drawer.stories.tsx
git add packages/design-system/src/components/Drawer/Drawer.stories.tsx
git commit -m "docs(drawer): AS-1033 resizable drawer story with OverflowList"
```

---

## Task 8: `ColumnResizingWithOverflowList` story in Table

**Files:**
- Modify: `packages/design-system/src/components/Table/mocks.tsx`
- Modify: `packages/design-system/src/components/Table/Table.stories.tsx`

- [ ] **Step 1: Extend `tags` in the mocks for a visible overflow**

In `packages/design-system/src/components/Table/mocks.tsx`, the `securityEvents` array currently has `tags: ['api-abuse', 'account-takeover']` for all rows. Replace (for all occurrences) with a longer set so the overflow is noticeable:

```tsx
    tags: ['api-abuse', 'account-takeover', 'credential-stuffing', 'scanner', 'brute-force'],
```

Run to check the number of occurrences: `grep -c "tags: \['api-abuse'" packages/design-system/src/components/Table/mocks.tsx`
Replace all via the editor/replace_all.

- [ ] **Step 2: Add the story to `Table.stories.tsx` (next to `ColumnResizing`, after line ~169)**

First add imports to the top of the file:

```tsx
import { OverflowList } from '../OverflowList';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tag } from '../Tag';
```

Then the story:

```tsx
const renderTableTagsOverflow = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/** Resizable column whose cell hosts an OverflowList — resize it to reflow tags. */
export const ColumnResizingWithOverflowList: StoryFn<typeof meta> = () => {
  const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({});

  const columns = useMemo<TableColumnDef<SecurityEvent>[]>(
    () => [
      ...securityColumns.slice(0, 1),
      {
        id: 'tags',
        header: 'Tags',
        size: 240,
        cell: ({ row }: { row: { original: SecurityEvent } }) => (
          <OverflowList
            className='gap-4'
            items={row.original.tags}
            itemRenderer={(item: string) => <Tag key={item}>{item}</Tag>}
            overflowRenderer={renderTableTagsOverflow}
          />
        ),
      },
      ...securityColumns.slice(1),
    ],
    [],
  );

  return (
    <Table
      data={securityEvents}
      columns={columns}
      getRowId={row => row.id}
      columnSizing={columnSizing}
      onColumnSizingChange={setColumnSizing}
    />
  );
};
```

> Check that `SecurityEvent`, `TableColumnDef`, `TableColumnSizingState`, `securityColumns`, `securityEvents` are already imported in `Table.stories.tsx` (see the existing `ColumnResizing`/`DynamicColumns` stories — `grep -n "TableColumnDef\|SecurityEvent\|TableColumnSizingState" packages/design-system/src/components/Table/Table.stories.tsx`). If something is missing — add it to the imports from `./mocks` and `./types`. Cross-check the exact shape of `cell`/`TableColumnDef` with the existing stories that use `useMemo<TableColumnDef<...>[]>` (lines ~567, ~626, ~709).

- [ ] **Step 3: Check types**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
npx biome check --write packages/design-system/src/components/Table/mocks.tsx packages/design-system/src/components/Table/Table.stories.tsx
git add packages/design-system/src/components/Table/mocks.tsx packages/design-system/src/components/Table/Table.stories.tsx
git commit -m "docs(table): AS-1033 resizable column story with OverflowList"
```

---

## Task 9: E2E drag-resize for Drawer and Table

**Files:**
- Modify: `packages/design-system/src/components/Drawer/Drawer.e2e.ts`
- Modify: `packages/design-system/src/components/Table/Table.e2e.ts`

> Drag via `page.mouse` is deterministic with a sufficient offset. Locators: the drawer handle is a `TooltipTrigger` with `cursor-col-resize`; column resize is a `data-testid` ending in `--resize` (see `TableResizeHandler.tsx`, `useTestId('resize')`). Before writing, confirm the real testids/roles via `grep`.

- [ ] **Step 1: Drawer — resize interaction test**

Add to `Drawer.e2e.ts` (in the existing `test.describe('Component: Drawer')`, the `Interactions` section; add the story to the `createStoryHelper` array: `'Resizable With Overflow List'`):

```ts
test.describe('Interactions', () => {
  test('Should reflow the OverflowList when the drawer is resized narrower', async ({ page }) => {
    await drawerStory.goto(page, 'Resizable With Overflow List');

    const tagsBefore = await page.locator('[data-slot="overflow-list"] [data-slot="tag"]').count();

    const dialog = page.getByRole('dialog');
    const box = await dialog.boundingBox();
    if (!box) throw new Error('drawer dialog not found');

    // Drag the left handle to the right → the drawer narrows.
    await page.mouse.move(box.x, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 250, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();

    await expect
      .poll(() => page.locator('[data-slot="overflow-list"] [data-slot="tag"]').count())
      .toBeLessThan(tagsBefore);
  });
});
```

> Cross-check the tag selector against the real `data-slot` (as in Task 6). If the drawer has multiple `dialog` roles — narrow the locator.

- [ ] **Step 2: Table — column resize interaction test**

Add to the `Table.e2e.ts` test file (if it has no `createStoryHelper` — create one modeled on `Drawer.e2e.ts`; the table story slug is `data-display-table` or per `meta.title`, check `grep -n "title:" packages/design-system/src/components/Table/Table.stories.tsx`):

```ts
import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tableStory = createStoryHelper('<table-story-slug>', [
  'Column Resizing With Overflow List',
] as const);

test.describe('Component: Table', () => {
  test.describe('Interactions', () => {
    test('Should reflow the OverflowList cell when the column is resized narrower', async ({
      page,
    }) => {
      await tableStory.goto(page, 'Column Resizing With Overflow List');

      const tagsBefore = await page
        .locator('[data-slot="overflow-list"] [data-slot="tag"]')
        .first()
        .locator('xpath=ancestor::*[@data-slot="overflow-list"]')
        .locator('[data-slot="tag"]')
        .count();

      const handle = page.locator('[data-testid$="--resize"]').first();
      const box = await handle.boundingBox();
      if (!box) throw new Error('resize handle not found');

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x - 160, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();

      await expect
        .poll(() =>
          page.locator('[data-slot="overflow-list"]').first().locator('[data-slot="tag"]').count(),
        )
        .toBeLessThan(tagsBefore);
    });
  });
});
```

> Replace `<table-story-slug>` with the real slug. If the table has no `data-testid` on the table/story — `createStoryHelper` still works by story id. Simplify the tag-count locator to the first `[data-slot="overflow-list"]` if the xpath turns out to be fragile.

- [ ] **Step 3: Run E2E**

Run: `pnpm --filter @wallarm-org/design-system test:e2e -- Drawer Table`
Expected: PASS. If the drag is flaky — increase `steps` and/or add `await page.waitForTimeout(50)` between the mouse phases.

- [ ] **Step 4: Commit**

```bash
npx biome check --write packages/design-system/src/components/Drawer/Drawer.e2e.ts packages/design-system/src/components/Table/Table.e2e.ts
git add packages/design-system/src/components/Drawer/Drawer.e2e.ts packages/design-system/src/components/Table/Table.e2e.ts
git commit -m "test(drawer,table): AS-1033 e2e reflow OverflowList on resize"
```

---

## Task 10: Final quality check

**Files:** none (checks only)

- [ ] **Step 1: Full typecheck + lint + unit tests**

Run:
```bash
pnpm --filter @wallarm-org/design-system typecheck
npx biome check packages/design-system/src
pnpm --filter @wallarm-org/design-system test
```
Expected: all green, 0 lint/type errors.

- [ ] **Step 2: Regression of `OverflowList` consumers**

Manually confirm (Storybook) that `Attribute` (`Data Display/Attribute`) and `Select` (multiple) with `OverflowList` render correctly — the API is not broken.

- [ ] **Step 3: Create the PR**

```bash
git push -u origin feature/AS-1033
gh pr create --title "feat(overflow-list): AS-1033 resizable container support" --body "<description>"
```

> The PR title is a conventional commit (validated by CI). The body — what was done + a link to the spec and the ticket.

---

## Self-Review (filled in by the plan author)

**Spec coverage:**
- Cause #1 (temp DOM) → Task 2 (block removed). ✅
- Cause #2 (rAF throttling of RO) → Task 2. ✅
- Cause #3 (getComputedStyle per tick) → Task 2 (gap read once). ✅
- Cause #4 (O(n²) indexOf) → Task 3. ✅
- Cause #5 (useMemo side-effect) → Task 3. ✅
- Cause #6 (inline MeasurementContainer) → Task 2 (`useCallback`). ✅
- Drawer demo → Task 7; Table → Task 8; standalone → Task 5. ✅
- Component tests → Task 4; E2E → Task 6 (standalone), Task 9 (drag). ✅
- API compatibility → Task 10 Step 2. ✅

**Types/signatures:** `calculateVisibleCount`/`CalculateVisibleCountParams` are defined in Task 1 and used in Task 2 without discrepancies. `UseOverflowItemsOptions`/`Result` do not change.

**Known risks (flagged in the tasks):**
- The width Tailwind classes in Task 5 may be missing → fallback to inline `style`.
- The `data-slot` on `OverflowList`/`Tag` must be confirmed before E2E (Task 6 Step 2 adds the slug if missing).
- The drag E2E in Task 9 is potentially flaky → mitigations noted (steps, polling).
- The `Drawer` open API (`defaultOpen` vs controlled) — verify in Task 7.
- The table story slug — confirm in Task 9.
```
