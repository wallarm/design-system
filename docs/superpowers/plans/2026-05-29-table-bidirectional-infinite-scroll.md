# Table Bidirectional Infinite Scroll — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add upward infinite scroll (`onStartReached` / `prev_cursor`) symmetric to the existing downward scroll, plus deep-link anchoring, with jump-free scroll position when rows are prepended.

**Architecture:** Manual scroll anchoring on the current TanStack Virtual 3.13.18 (no dependency upgrade). All feature logic lives in a cohesive `hooks/infiniteScroll/` slice exposing a single `useInfiniteScroll` orchestrator; pure helpers and constants go to `lib/`. Data stays consumer-managed — the Table only detects edges, compensates `scrollTop` on prepend, and positions the initial anchor.

**Tech Stack:** React 19, TypeScript (strict), TanStack Table 8.21.3, TanStack Virtual 3.13.18, Vitest + Testing Library (unit), Playwright (E2E), Biome (lint/format).

**Spec:** `docs/superpowers/specs/2026-05-29-table-bidirectional-infinite-scroll-design.md`

**Conventions:**
- All commands assume cwd `packages/design-system` (the `@wallarm-org/design-system` package).
- Run a single unit file: `pnpm exec vitest run <relative-path>`.
- Typecheck: `pnpm exec tsc -p tsconfig.app.json --noEmit` (the `typecheck` script is a no-op).
- Format/lint changed files before each commit: `npx biome check --write <paths>`.
- Conventional commits, scope `table`, ticket `AS-1026`, e.g. `feat(table): AS-1026 ...`.
- Comments: short one-line JSDoc per hook/helper; explain only the non-obvious.

**File map (created / modified):**
- Create `src/components/Table/lib/detectDataChange.ts` (+ `__tests__/detectDataChange.test.ts`)
- Create `src/components/Table/lib/getRowKey.ts` (+ `__tests__/getRowKey.test.ts`)
- Modify `src/components/Table/lib/constants.ts`, `src/components/Table/lib/index.ts`
- Create `src/components/Table/hooks/infiniteScroll/useScrollEdge.ts` (+ test)
- Create `src/components/Table/hooks/infiniteScroll/usePrependScrollAnchor.ts` (+ test)
- Create `src/components/Table/hooks/infiniteScroll/useInitialAnchor.ts`
- Create `src/components/Table/hooks/infiniteScroll/useInfiniteScroll.ts`
- Create `src/components/Table/hooks/infiniteScroll/index.ts`
- Modify `src/components/Table/hooks/index.ts`; delete `src/components/Table/hooks/useEndReached.ts`
- Modify `src/components/Table/types.ts`, `src/components/Table/TableContext/types.ts`, `src/components/Table/TableContext/TableProvider.tsx`
- Modify `src/components/Table/TableBody/TableBodyVirtualizedContainer.tsx`, `TableBodyVirtualizedWindow.tsx`, `useResetVirtualizerOnDataChange.ts`
- Modify `src/components/Table/TableInner/TableInnerContainer.tsx`, `TableInnerWindow.tsx`
- Modify `src/components/Table/mocks.tsx`, `src/components/Table/Table.stories.tsx`, `src/components/Table/Table.e2e.ts`

---

## Task 1: `lib/detectDataChange` — pure prepend/replace detector

Single source of truth for distinguishing a prepend from a full dataset replacement. Consumed by the anchor hook (Task 5) and the virtualizer reset hook (Task 10).

**Files:**
- Create: `src/components/Table/lib/detectDataChange.ts`
- Test: `src/components/Table/lib/__tests__/detectDataChange.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/Table/lib/__tests__/detectDataChange.test.ts
import { describe, expect, it } from 'vitest';
import { detectDataChange } from '../detectDataChange';

const rows = (...ids: string[]) => ids.map(id => ({ id }));

describe('detectDataChange', () => {
  it('returns "none" on first render (no previous first id)', () => {
    expect(detectDataChange(undefined, rows('a', 'b'))).toBe('none');
  });

  it('returns "none" when the first row is unchanged', () => {
    expect(detectDataChange('a', rows('a', 'b', 'c'))).toBe('none');
  });

  it('returns "prepend" when the first id changed but is still present', () => {
    expect(detectDataChange('b', rows('a', 'b', 'c'))).toBe('prepend');
  });

  it('returns "replace" when the previous first id is gone', () => {
    expect(detectDataChange('x', rows('a', 'b', 'c'))).toBe('replace');
  });

  it('returns "replace" when rows became empty', () => {
    expect(detectDataChange('a', rows())).toBe('replace');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/Table/lib/__tests__/detectDataChange.test.ts`
Expected: FAIL — `detectDataChange` not found / module missing.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/Table/lib/detectDataChange.ts

/** Classifies a data change by comparing the previous first row id to the new rows. */
export const detectDataChange = (
  prevFirstRowId: string | undefined,
  rows: { id: string }[],
): 'prepend' | 'replace' | 'none' => {
  const currentFirstId = rows[0]?.id;
  if (prevFirstRowId === undefined) return 'none';
  if (currentFirstId === prevFirstRowId) return 'none';
  return rows.some(r => r.id === prevFirstRowId) ? 'prepend' : 'replace';
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/Table/lib/__tests__/detectDataChange.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
npx biome check --write src/components/Table/lib/detectDataChange.ts src/components/Table/lib/__tests__/detectDataChange.test.ts
git add src/components/Table/lib/detectDataChange.ts src/components/Table/lib/__tests__/detectDataChange.test.ts
git commit -m "feat(table): AS-1026 add detectDataChange helper"
```

---

## Task 2: `lib/getRowKey` — stable virtual item key helper

Shared `getItemKey` body for both virtualizers (Task 10).

**Files:**
- Create: `src/components/Table/lib/getRowKey.ts`
- Test: `src/components/Table/lib/__tests__/getRowKey.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/Table/lib/__tests__/getRowKey.test.ts
import { describe, expect, it } from 'vitest';
import { getRowKey } from '../getRowKey';

describe('getRowKey', () => {
  const rows = [{ id: 'a' }, { id: 'b' }];

  it('returns the row id at the index', () => {
    expect(getRowKey(rows, 1)).toBe('b');
  });

  it('falls back to the index when the row is missing', () => {
    expect(getRowKey(rows, 5)).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/Table/lib/__tests__/getRowKey.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/Table/lib/getRowKey.ts

/** Stable virtualizer item key: the row id, or the index as fallback. */
export const getRowKey = (rows: { id: string }[], index: number): string | number =>
  rows[index]?.id ?? index;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/Table/lib/__tests__/getRowKey.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
npx biome check --write src/components/Table/lib/getRowKey.ts src/components/Table/lib/__tests__/getRowKey.test.ts
git add src/components/Table/lib/getRowKey.ts src/components/Table/lib/__tests__/getRowKey.test.ts
git commit -m "feat(table): AS-1026 add getRowKey helper"
```

---

## Task 3: Constants — start threshold and shared cooldown

**Files:**
- Modify: `src/components/Table/lib/constants.ts`
- Modify: `src/components/Table/lib/index.ts`

- [ ] **Step 1: Add constants**

In `src/components/Table/lib/constants.ts`, replace the line:

```ts
export const TABLE_END_REACHED_THRESHOLD = 200;
```

with:

```ts
export const TABLE_END_REACHED_THRESHOLD = 200;
export const TABLE_START_REACHED_THRESHOLD = 200;

/** Minimum time (ms) between successive edge-reached callbacks. */
export const SCROLL_EDGE_COOLDOWN_MS = 200;
```

- [ ] **Step 2: Export from `lib/index.ts`**

In `src/components/Table/lib/index.ts`, update the `./constants` re-export block to add the two new names (keep alphabetical grouping):

```ts
export {
  getAlignClass,
  getExpandBorderClass,
  SCROLL_EDGE_COOLDOWN_MS,
  SORT_LABELS,
  TABLE_END_REACHED_THRESHOLD,
  TABLE_EXPAND_COLUMN_ID,
  TABLE_EXPAND_COLUMN_WIDTH,
  TABLE_MIN_COLUMN_WIDTH,
  TABLE_SELECT_COLUMN_ID,
  TABLE_SELECT_COLUMN_WIDTH,
  TABLE_SKELETON_ROWS,
  TABLE_START_REACHED_THRESHOLD,
  TABLE_VIRTUALIZATION_OVERSCAN,
} from './constants';
```

Then add exports for the two new helpers from Tasks 1–2 anywhere in the same file:

```ts
export { detectDataChange } from './detectDataChange';
export { getRowKey } from './getRowKey';
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
npx biome check --write src/components/Table/lib/constants.ts src/components/Table/lib/index.ts
git add src/components/Table/lib/constants.ts src/components/Table/lib/index.ts
git commit -m "feat(table): AS-1026 add start-threshold and cooldown constants"
```

---

## Task 4: `useScrollEdge` — generalized edge detector

Refactor of the old `useEndReached` into a parameterized `edge: 'start' | 'end'` hook with an `enabled` gate.

**Files:**
- Create: `src/components/Table/hooks/infiniteScroll/useScrollEdge.ts`
- Test: `src/components/Table/hooks/infiniteScroll/__tests__/useScrollEdge.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/Table/hooks/infiniteScroll/__tests__/useScrollEdge.test.ts
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollEdge } from '../useScrollEdge';

interface FakeEl {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
  addEventListener: (t: string, cb: (e: Event) => void) => void;
  removeEventListener: () => void;
  fire: () => void;
}

const makeEl = (init: Partial<FakeEl> = {}): FakeEl => {
  let handler: ((e: Event) => void) | null = null;
  return {
    scrollTop: 0,
    clientHeight: 100,
    scrollHeight: 1000,
    ...init,
    addEventListener: (_t, cb) => {
      handler = cb;
    },
    removeEventListener: () => {
      handler = null;
    },
    fire: () => handler?.(new Event('scroll')),
  };
};

describe('useScrollEdge', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(10_000);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fires onReached for the end edge when near the bottom', () => {
    const el = makeEl({ scrollTop: 850 }); // distance = 1000 - 850 - 100 = 50 <= 200
    const onReached = vi.fn();
    renderHook(() =>
      useScrollEdge({
        edge: 'end',
        mode: 'container',
        scrollRef: { current: el as unknown as HTMLElement },
        onReached,
        threshold: 200,
      }),
    );
    expect(onReached).toHaveBeenCalledTimes(1); // immediate mount check
  });

  it('fires onReached for the start edge when near the top', () => {
    const el = makeEl({ scrollTop: 50 }); // start distance = scrollTop = 50 <= 200
    const onReached = vi.fn();
    renderHook(() =>
      useScrollEdge({
        edge: 'start',
        mode: 'container',
        scrollRef: { current: el as unknown as HTMLElement },
        onReached,
        threshold: 200,
      }),
    );
    expect(onReached).toHaveBeenCalledTimes(1);
  });

  it('re-arms only after scrolling past the threshold', () => {
    const el = makeEl({ scrollTop: 0 });
    const onReached = vi.fn();
    renderHook(() =>
      useScrollEdge({
        edge: 'start',
        mode: 'container',
        scrollRef: { current: el as unknown as HTMLElement },
        onReached,
        threshold: 200,
      }),
    );
    expect(onReached).toHaveBeenCalledTimes(1); // mount

    el.scrollTop = 50;
    el.fire(); // still within threshold, already fired → no re-fire
    expect(onReached).toHaveBeenCalledTimes(1);

    el.scrollTop = 500;
    el.fire(); // past threshold → re-arm
    el.scrollTop = 0;
    Date.now = vi.fn(() => 10_500); // advance past cooldown
    el.fire(); // back near top → fires again
    expect(onReached).toHaveBeenCalledTimes(2);
  });

  it('does not fire while disabled', () => {
    const el = makeEl({ scrollTop: 0 });
    const onReached = vi.fn();
    renderHook(() =>
      useScrollEdge({
        edge: 'start',
        mode: 'container',
        scrollRef: { current: el as unknown as HTMLElement },
        onReached,
        threshold: 200,
        enabled: false,
      }),
    );
    el.fire();
    expect(onReached).not.toHaveBeenCalled();
  });

  it('respects the cooldown between fires', () => {
    const el = makeEl({ scrollTop: 0 });
    const onReached = vi.fn();
    renderHook(() =>
      useScrollEdge({
        edge: 'start',
        mode: 'container',
        scrollRef: { current: el as unknown as HTMLElement },
        onReached,
        threshold: 200,
      }),
    );
    expect(onReached).toHaveBeenCalledTimes(1); // mount at t=10000

    el.scrollTop = 500;
    el.fire(); // re-arm
    el.scrollTop = 0;
    el.fire(); // same timestamp 10000 → within cooldown → suppressed
    expect(onReached).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/Table/hooks/infiniteScroll/__tests__/useScrollEdge.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/Table/hooks/infiniteScroll/useScrollEdge.ts
import { type RefObject, useEffect, useRef } from 'react';
import { SCROLL_EDGE_COOLDOWN_MS } from '../../lib';

type ScrollMode = 'container' | 'window';
type ScrollEdge = 'start' | 'end';

interface UseScrollEdgeOptions {
  edge: ScrollEdge;
  mode: ScrollMode;
  /** Scroll element ref — required for `container` mode */
  scrollRef?: RefObject<HTMLElement | null>;
  onReached?: () => void;
  threshold: number;
  /** When false, suppresses firing (e.g. while the initial anchor scroll settles) */
  enabled?: boolean;
}

/**
 * Fires `onReached` once when the user scrolls within `threshold` px of the
 * given edge. Re-arms after scrolling back past the threshold. A cooldown
 * guard prevents rapid re-fires when prepended/appended rows grow the content.
 */
export const useScrollEdge = ({
  edge,
  mode,
  scrollRef,
  onReached,
  threshold,
  enabled = true,
}: UseScrollEdgeOptions) => {
  const firedRef = useRef(false);
  const lastFiredAtRef = useRef(0);

  // Latest-callback ref: re-running the effect on identity changes races with
  // `firedRef` and fires twice per page.
  const onReachedRef = useRef(onReached);
  useEffect(() => {
    onReachedRef.current = onReached;
  });
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  });

  useEffect(() => {
    const check = () => {
      const callback = onReachedRef.current;
      if (!callback || !enabledRef.current) return;

      let scrollTop: number;
      let clientHeight: number;
      let scrollHeight: number;

      if (mode === 'window') {
        scrollTop = window.scrollY;
        clientHeight = window.innerHeight;
        scrollHeight = document.documentElement.scrollHeight;
      } else {
        const el = scrollRef?.current;
        if (!el) return;
        scrollTop = el.scrollTop;
        clientHeight = el.clientHeight;
        scrollHeight = el.scrollHeight;
      }

      const distance = edge === 'start' ? scrollTop : scrollHeight - scrollTop - clientHeight;

      if (distance <= threshold) {
        const now = Date.now();
        if (!firedRef.current && now - lastFiredAtRef.current >= SCROLL_EDGE_COOLDOWN_MS) {
          firedRef.current = true;
          lastFiredAtRef.current = now;
          callback();
        }
      } else {
        firedRef.current = false;
      }
    };

    const target = mode === 'window' ? window : scrollRef?.current;
    if (!target) return;

    target.addEventListener('scroll', check, { passive: true });
    check();

    return () => {
      target.removeEventListener('scroll', check);
    };
  }, [edge, mode, scrollRef, threshold]);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/Table/hooks/infiniteScroll/__tests__/useScrollEdge.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
npx biome check --write src/components/Table/hooks/infiniteScroll/useScrollEdge.ts src/components/Table/hooks/infiniteScroll/__tests__/useScrollEdge.test.ts
git add src/components/Table/hooks/infiniteScroll/useScrollEdge.ts src/components/Table/hooks/infiniteScroll/__tests__/useScrollEdge.test.ts
git commit -m "feat(table): AS-1026 add useScrollEdge edge detector"
```

---

## Task 5: `usePrependScrollAnchor` — jump-free prepend

**Files:**
- Create: `src/components/Table/hooks/infiniteScroll/usePrependScrollAnchor.ts`
- Test: `src/components/Table/hooks/infiniteScroll/__tests__/usePrependScrollAnchor.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/Table/hooks/infiniteScroll/__tests__/usePrependScrollAnchor.test.ts
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePrependScrollAnchor } from '../usePrependScrollAnchor';

const el = { scrollTop: 0, scrollHeight: 1000 } as HTMLElement;

describe('usePrependScrollAnchor', () => {
  it('compensates scrollTop by the height delta when rows are prepended', () => {
    el.scrollTop = 0;
    el.scrollHeight = 1000;
    const scrollRef = { current: el };

    const { rerender } = renderHook(
      ({ rows }: { rows: { id: string }[] }) =>
        usePrependScrollAnchor({ mode: 'container', scrollRef, rows }),
      { initialProps: { rows: [{ id: 'b' }, { id: 'c' }] } },
    );

    // Simulate prepend: 'a' added on top, content grew by 100px.
    el.scrollHeight = 1100;
    rerender({ rows: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });

    expect(el.scrollTop).toBe(100);
  });

  it('does not touch scrollTop on a full replacement', () => {
    el.scrollTop = 0;
    el.scrollHeight = 1000;
    const scrollRef = { current: el };

    const { rerender } = renderHook(
      ({ rows }: { rows: { id: string }[] }) =>
        usePrependScrollAnchor({ mode: 'container', scrollRef, rows }),
      { initialProps: { rows: [{ id: 'b' }, { id: 'c' }] } },
    );

    el.scrollHeight = 1100;
    rerender({ rows: [{ id: 'x' }, { id: 'y' }] }); // previous first 'b' gone → replace

    expect(el.scrollTop).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/Table/hooks/infiniteScroll/__tests__/usePrependScrollAnchor.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/Table/hooks/infiniteScroll/usePrependScrollAnchor.ts
import { type RefObject, useLayoutEffect, useRef } from 'react';
import { detectDataChange } from '../../lib';

interface UsePrependScrollAnchorOptions {
  mode: 'container' | 'window';
  scrollRef?: RefObject<HTMLElement | null>;
  rows: { id: string }[];
}

/**
 * Keeps the viewport visually stable when rows are prepended: measures the
 * scrollHeight delta and adds it to scrollTop. Runs in a layout effect so the
 * adjustment lands before paint (no flicker).
 */
export const usePrependScrollAnchor = ({ mode, scrollRef, rows }: UsePrependScrollAnchorOptions) => {
  const prevFirstRowIdRef = useRef<string | undefined>(rows[0]?.id);
  const prevScrollHeightRef = useRef(0);

  useLayoutEffect(() => {
    const getScrollHeight = () =>
      mode === 'window'
        ? document.documentElement.scrollHeight
        : (scrollRef?.current?.scrollHeight ?? 0);

    if (detectDataChange(prevFirstRowIdRef.current, rows) === 'prepend') {
      const delta = getScrollHeight() - prevScrollHeightRef.current;
      if (delta > 0) {
        if (mode === 'window') window.scrollBy(0, delta);
        else if (scrollRef?.current) scrollRef.current.scrollTop += delta;
      }
    }

    prevFirstRowIdRef.current = rows[0]?.id;
    prevScrollHeightRef.current = getScrollHeight();
  }, [rows, mode, scrollRef]);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/Table/hooks/infiniteScroll/__tests__/usePrependScrollAnchor.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
npx biome check --write src/components/Table/hooks/infiniteScroll/usePrependScrollAnchor.ts src/components/Table/hooks/infiniteScroll/__tests__/usePrependScrollAnchor.test.ts
git add src/components/Table/hooks/infiniteScroll/usePrependScrollAnchor.ts src/components/Table/hooks/infiniteScroll/__tests__/usePrependScrollAnchor.test.ts
git commit -m "feat(table): AS-1026 add usePrependScrollAnchor"
```

---

## Task 6: `useInitialAnchor` — initial scroll + arming gate

**Files:**
- Create: `src/components/Table/hooks/infiniteScroll/useInitialAnchor.ts`

- [ ] **Step 1: Write the implementation**

```ts
// src/components/Table/hooks/infiniteScroll/useInitialAnchor.ts
import { type RefObject, useEffect, useRef, useState } from 'react';
import type { TableVirtualizerInstance } from '../../TableContext/types';

interface UseInitialAnchorOptions {
  initialScrollToRowId?: string;
  rows: { id: string }[];
  virtualizerRef: RefObject<TableVirtualizerInstance | null>;
}

/**
 * Scrolls to the anchor row once on mount and returns `ready`, which gates the
 * edge detectors until the initial scroll has settled. Without this, a table
 * mounted at scrollTop 0 would fire `onStartReached` immediately.
 */
export const useInitialAnchor = ({
  initialScrollToRowId,
  rows,
  virtualizerRef,
}: UseInitialAnchorOptions): boolean => {
  const [ready, setReady] = useState(!initialScrollToRowId);
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current || !initialScrollToRowId) return;

    const virtualizer = virtualizerRef.current;
    if (!virtualizer) {
      // Non-virtualized — nothing to gate; arm immediately.
      doneRef.current = true;
      setReady(true);
      return;
    }

    const index = rows.findIndex(r => r.id === initialScrollToRowId);
    if (index < 0) return; // anchor not loaded yet — retry on next data change

    virtualizer.scrollToIndex(index, { align: 'center' });
    doneRef.current = true;
    requestAnimationFrame(() => setReady(true));
  }, [initialScrollToRowId, rows, virtualizerRef]);

  return ready;
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
npx biome check --write src/components/Table/hooks/infiniteScroll/useInitialAnchor.ts
git add src/components/Table/hooks/infiniteScroll/useInitialAnchor.ts
git commit -m "feat(table): AS-1026 add useInitialAnchor"
```

---

## Task 7: `useInfiniteScroll` orchestrator + slice barrel

Composes the start/end detectors, prepend anchor, and initial anchor into one hook.

**Files:**
- Create: `src/components/Table/hooks/infiniteScroll/useInfiniteScroll.ts`
- Create: `src/components/Table/hooks/infiniteScroll/index.ts`

- [ ] **Step 1: Write the orchestrator**

```ts
// src/components/Table/hooks/infiniteScroll/useInfiniteScroll.ts
import { type RefObject } from 'react';
import type { Table } from '@tanstack/react-table';
import { TABLE_END_REACHED_THRESHOLD, TABLE_START_REACHED_THRESHOLD } from '../../lib';
import type { TableVirtualizerInstance } from '../../TableContext/types';
import { useInitialAnchor } from './useInitialAnchor';
import { usePrependScrollAnchor } from './usePrependScrollAnchor';
import { useScrollEdge } from './useScrollEdge';

interface UseInfiniteScrollOptions<T> {
  mode: 'container' | 'window';
  /** Scroll element ref — required for `container` mode */
  scrollRef?: RefObject<HTMLElement | null>;
  table: Table<T>;
  virtualizerRef: RefObject<TableVirtualizerInstance | null>;
  onStartReached?: () => void;
  onStartReachedThreshold?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  initialScrollToRowId?: string;
}

/** Single entry point for bidirectional infinite scroll behavior. */
export const useInfiniteScroll = <T,>({
  mode,
  scrollRef,
  table,
  virtualizerRef,
  onStartReached,
  onStartReachedThreshold,
  onEndReached,
  onEndReachedThreshold,
  initialScrollToRowId,
}: UseInfiniteScrollOptions<T>) => {
  const rows = table.getRowModel().rows;

  const ready = useInitialAnchor({ initialScrollToRowId, rows, virtualizerRef });

  usePrependScrollAnchor({ mode, scrollRef, rows });

  useScrollEdge({
    edge: 'start',
    mode,
    scrollRef,
    onReached: onStartReached,
    threshold: onStartReachedThreshold ?? TABLE_START_REACHED_THRESHOLD,
    enabled: ready,
  });

  useScrollEdge({
    edge: 'end',
    mode,
    scrollRef,
    onReached: onEndReached,
    threshold: onEndReachedThreshold ?? TABLE_END_REACHED_THRESHOLD,
    enabled: ready,
  });
};
```

- [ ] **Step 2: Write the slice barrel**

```ts
// src/components/Table/hooks/infiniteScroll/index.ts
export { useInfiniteScroll } from './useInfiniteScroll';
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
npx biome check --write src/components/Table/hooks/infiniteScroll/useInfiniteScroll.ts src/components/Table/hooks/infiniteScroll/index.ts
git add src/components/Table/hooks/infiniteScroll/useInfiniteScroll.ts src/components/Table/hooks/infiniteScroll/index.ts
git commit -m "feat(table): AS-1026 add useInfiniteScroll orchestrator"
```

---

## Task 8: Retire `useEndReached`, export the slice

**Files:**
- Modify: `src/components/Table/hooks/index.ts`
- Delete: `src/components/Table/hooks/useEndReached.ts`

- [ ] **Step 1: Update `hooks/index.ts`**

Replace the contents of `src/components/Table/hooks/index.ts` with:

```ts
export { useHorizontalScrollState } from './useHorizontalScrollState';
export { useInfiniteScroll } from './infiniteScroll';
export { useMasterCell } from './useMasterCell';
export { useTableState } from './useTableState';
```

- [ ] **Step 2: Delete the old hook**

```bash
git rm src/components/Table/hooks/useEndReached.ts
```

- [ ] **Step 3: Typecheck (expect failures in TableInner — fixed in Task 11)**

Run: `pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: errors only in `TableInnerContainer.tsx` / `TableInnerWindow.tsx` referencing the removed `useEndReached`. These are resolved in Task 11; do not commit until then.

- [ ] **Step 4: Do not commit yet** — combined with Task 11.

---

## Task 9: Public + context props

**Files:**
- Modify: `src/components/Table/types.ts:242-246`
- Modify: `src/components/Table/TableContext/types.ts:75-77`
- Modify: `src/components/Table/TableContext/TableProvider.tsx`

- [ ] **Step 1: Add public props in `types.ts`**

In `src/components/Table/types.ts`, replace the `// --- Infinite scroll ---` block (lines 242–246):

```ts
  // --- Infinite scroll ---
  /** Callback fired when the user scrolls near the end of the table */
  onEndReached?: () => void;
  /** Distance from the bottom (in px) to trigger onEndReached (default: 200) */
  onEndReachedThreshold?: number;
```

with:

```ts
  // --- Infinite scroll (bidirectional) ---
  /** Callback fired when the user scrolls near the end (bottom) of the table */
  onEndReached?: () => void;
  /** Distance from the bottom (in px) to trigger onEndReached (default: 200) */
  onEndReachedThreshold?: number;
  /** Callback fired when the user scrolls near the start (top) of the table */
  onStartReached?: () => void;
  /** Distance from the top (in px) to trigger onStartReached (default: 200) */
  onStartReachedThreshold?: number;
  /**
   * Row id to anchor the initial scroll position to. The table scrolls this row
   * into view on mount and arms the edge detectors only after that initial
   * scroll settles. Use for deep-linking into the middle of a dataset.
   */
  initialScrollToRowId?: string;
```

- [ ] **Step 2: Add context fields in `TableContext/types.ts`**

In `src/components/Table/TableContext/types.ts`, replace the `// Infinite scroll` block (lines 75–77):

```ts
  // Infinite scroll
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
```

with:

```ts
  // Infinite scroll (bidirectional)
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onStartReached?: () => void;
  onStartReachedThreshold?: number;
  initialScrollToRowId?: string;
```

- [ ] **Step 3: Wire through `TableProvider.tsx`**

In `src/components/Table/TableContext/TableProvider.tsx`, in the props destructuring (around line 82–83) replace:

```ts
    onEndReached,
    onEndReachedThreshold,
```

with:

```ts
    onEndReached,
    onEndReachedThreshold,
    onStartReached,
    onStartReachedThreshold,
    initialScrollToRowId,
```

In the `contextValue` object (around line 323–324) replace:

```ts
      onEndReached,
      onEndReachedThreshold,
```

with:

```ts
      onEndReached,
      onEndReachedThreshold,
      onStartReached,
      onStartReachedThreshold,
      initialScrollToRowId,
```

In the `useMemo` dependency array (around line 350–351) replace:

```ts
      onEndReached,
      onEndReachedThreshold,
```

with:

```ts
      onEndReached,
      onEndReachedThreshold,
      onStartReached,
      onStartReachedThreshold,
      initialScrollToRowId,
```

- [ ] **Step 4: Typecheck (TableInner errors from Task 8 still expected)**

Run: `pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: only the Task-8 `useEndReached` errors remain; no new errors from this task.

- [ ] **Step 5: Do not commit yet** — combined with Task 11.

---

## Task 10: `getItemKey` + prepend-aware virtualizer reset

**Files:**
- Modify: `src/components/Table/TableBody/TableBodyVirtualizedContainer.tsx`
- Modify: `src/components/Table/TableBody/TableBodyVirtualizedWindow.tsx`
- Modify: `src/components/Table/TableBody/useResetVirtualizerOnDataChange.ts`

- [ ] **Step 1: Add `getItemKey` to the container virtualizer**

In `TableBodyVirtualizedContainer.tsx`, add the import:

```ts
import { getRowKey, TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';
```

(replace the existing `import { TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';`).

Then in the `useVirtualizer({...})` config add a `getItemKey`:

```ts
  const virtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement,
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
    getItemKey: useCallback(
      (index: number) => getRowKey(table.getRowModel().rows, index),
      [table],
    ),
  });
```

(`useCallback` is already imported in this file.)

- [ ] **Step 2: Add `getItemKey` to the window virtualizer**

In `TableBodyVirtualizedWindow.tsx`, update the import:

```ts
import { getRowKey, TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';
```

Then in the `useWindowVirtualizer({...})` config add:

```ts
  const virtualizer = useWindowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
    scrollMargin: tbodyRef.current ? getDocumentOffsetTop(tbodyRef.current) : 0,
    getItemKey: useCallback(
      (index: number) => getRowKey(table.getRowModel().rows, index),
      [table],
    ),
  });
```

(`useCallback` is already imported in this file.)

- [ ] **Step 3: Make reset prepend-aware**

Replace the contents of `src/components/Table/TableBody/useResetVirtualizerOnDataChange.ts` with:

```ts
import { useEffect, useRef } from 'react';
import type { Table } from '@tanstack/react-table';
import type { Virtualizer } from '@tanstack/react-virtual';
import { detectDataChange } from '../lib';

/**
 * Reset cached measurements only on a full dataset replacement. On a prepend
 * (infinite scroll up) measurements are kept — usePrependScrollAnchor handles
 * the position — so the virtualizer does not re-measure and jump.
 */
export const useResetVirtualizerOnDataChange = (
  table: Table<unknown>,
  virtualizer:
    | Virtualizer<Element, Element>
    | Virtualizer<Window, Element>
    | Virtualizer<HTMLElement, Element>,
) => {
  const rows = table.getRowModel().rows;
  const firstRowId = rows[0]?.id;
  const prevFirstRowIdRef = useRef(firstRowId);

  useEffect(() => {
    if (prevFirstRowIdRef.current !== firstRowId) {
      const change = detectDataChange(prevFirstRowIdRef.current, rows);
      prevFirstRowIdRef.current = firstRowId;
      if (change === 'replace') virtualizer.measure();
    }
  }, [firstRowId, rows, virtualizer]);
};
```

- [ ] **Step 4: Typecheck (TableInner errors from Task 8 still expected)**

Run: `pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: only the Task-8 `useEndReached` errors remain.

- [ ] **Step 5: Do not commit yet** — combined with Task 11.

---

## Task 11: Wire `useInfiniteScroll` into the inner components

Replaces the `useEndReached` calls and resolves the Task 8–10 typecheck errors.

**Files:**
- Modify: `src/components/Table/TableInner/TableInnerContainer.tsx:34-44`
- Modify: `src/components/Table/TableInner/TableInnerWindow.tsx:25-35`

- [ ] **Step 1: Update `TableInnerContainer.tsx`**

Replace the import line:

```ts
import { useEndReached } from '../hooks';
```

with:

```ts
import { useInfiniteScroll } from '../hooks';
```

Replace the context destructuring + `useEndReached` call (lines 34–44):

```ts
  const { containerRef, table, onEndReached, onEndReachedThreshold } = useTableContext();
  const testId = useTestId('container');
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  useEndReached({
    mode: 'container',
    scrollRef: containerRef,
    onEndReached,
    threshold: onEndReachedThreshold,
  });
```

with:

```ts
  const {
    containerRef,
    table,
    virtualizerRef,
    onEndReached,
    onEndReachedThreshold,
    onStartReached,
    onStartReachedThreshold,
    initialScrollToRowId,
  } = useTableContext();
  const testId = useTestId('container');
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  useInfiniteScroll({
    mode: 'container',
    scrollRef: containerRef,
    table,
    virtualizerRef,
    onEndReached,
    onEndReachedThreshold,
    onStartReached,
    onStartReachedThreshold,
    initialScrollToRowId,
  });
```

- [ ] **Step 2: Update `TableInnerWindow.tsx`**

Replace the import line:

```ts
import { useEndReached } from '../hooks';
```

with:

```ts
import { useInfiniteScroll } from '../hooks';
```

Replace the context destructuring + `useEndReached` call (lines 25–35):

```ts
  const { table, onEndReached, onEndReachedThreshold } = useTableContext();
  const testId = useTestId('window');
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(rootRef);

  useEndReached({
    mode: 'window',
    onEndReached,
    threshold: onEndReachedThreshold,
  });
```

with:

```ts
  const {
    table,
    virtualizerRef,
    onEndReached,
    onEndReachedThreshold,
    onStartReached,
    onStartReachedThreshold,
    initialScrollToRowId,
  } = useTableContext();
  const testId = useTestId('window');
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(rootRef);

  useInfiniteScroll({
    mode: 'window',
    table,
    virtualizerRef,
    onEndReached,
    onEndReachedThreshold,
    onStartReached,
    onStartReachedThreshold,
    initialScrollToRowId,
  });
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors.

- [ ] **Step 4: Run the full Table unit suite**

Run: `pnpm exec vitest run src/components/Table`
Expected: PASS (all hook tests from Tasks 1–5).

- [ ] **Step 5: Commit (Tasks 8–11 together)**

```bash
npx biome check --write src/components/Table
git add src/components/Table
git commit -m "feat(table): AS-1026 wire bidirectional infinite scroll into Table"
```

---

## Task 12: `useBidirectionalData` mock

**Files:**
- Modify: `src/components/Table/mocks.tsx`

- [ ] **Step 1: Add the hook**

Append to `src/components/Table/mocks.tsx` (it already imports `useCallback`, `useMemo`, `useState` and exposes `createLargeSecurityEvents`; reuse them — do not re-import). Add:

```tsx
const BIDIRECTIONAL_TOTAL = 500;
const BIDIRECTIONAL_PAGE_SIZE = 50;
const BIDIRECTIONAL_INITIAL_ANCHOR_INDEX = 250;

/**
 * Mock for bidirectional infinite scroll: opens a window around an anchor row
 * and exposes cursor-style fetchers for both directions.
 */
export const useBidirectionalData = () => {
  const allData = useMemo(() => createLargeSecurityEvents(BIDIRECTIONAL_TOTAL), []);

  const initialStart = Math.max(0, BIDIRECTIONAL_INITIAL_ANCHOR_INDEX - BIDIRECTIONAL_PAGE_SIZE);
  const initialEnd = Math.min(allData.length, BIDIRECTIONAL_INITIAL_ANCHOR_INDEX + BIDIRECTIONAL_PAGE_SIZE);

  const [range, setRange] = useState({ start: initialStart, end: initialEnd });
  const [isFetching, setIsFetching] = useState(false);

  const data = useMemo(() => allData.slice(range.start, range.end), [allData, range]);
  const anchorId = allData[BIDIRECTIONAL_INITIAL_ANCHOR_INDEX]?.id;
  const hasPrev = range.start > 0;
  const hasNext = range.end < allData.length;

  const fetchPrevPage = useCallback(() => {
    if (isFetching || range.start <= 0) return;
    setIsFetching(true);
    setTimeout(() => {
      setRange(prev => ({ ...prev, start: Math.max(0, prev.start - BIDIRECTIONAL_PAGE_SIZE) }));
      setIsFetching(false);
    }, 400);
  }, [isFetching, range.start]);

  const fetchNextPage = useCallback(() => {
    if (isFetching || range.end >= allData.length) return;
    setIsFetching(true);
    setTimeout(() => {
      setRange(prev => ({
        ...prev,
        end: Math.min(allData.length, prev.end + BIDIRECTIONAL_PAGE_SIZE),
      }));
      setIsFetching(false);
    }, 400);
  }, [isFetching, range.end, allData.length]);

  return { data, anchorId, isFetching, hasPrev, hasNext, fetchPrevPage, fetchNextPage };
};
```

If `createLargeSecurityEvents`, `useCallback`, `useMemo`, or `useState` are not already imported in `mocks.tsx`, add them to the existing imports (verify the existing `useInfiniteData` hook above — it uses the same set).

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
npx biome check --write src/components/Table/mocks.tsx
git add src/components/Table/mocks.tsx
git commit -m "test(table): AS-1026 add useBidirectionalData mock"
```

---

## Task 13: Stories

**Files:**
- Modify: `src/components/Table/Table.stories.tsx`

- [ ] **Step 1: Import the mock**

In `Table.stories.tsx`, add `useBidirectionalData` to the existing import from `./mocks` (the file already imports `useInfiniteData` and `securityColumns` from there).

- [ ] **Step 2: Add the story after `InfiniteScrollWindow`**

```tsx
export const BidirectionalInfiniteScroll: StoryFn<typeof meta> = () => {
  const { data, anchorId, isFetching, hasPrev, hasNext, fetchPrevPage, fetchNextPage } =
    useBidirectionalData();

  return (
    <VStack gap={8}>
      <Text size='sm' color='secondary'>
        Window of {data.length} rows around the anchor {isFetching && '— loading...'}
        {!hasPrev && ' — top reached'}
        {!hasNext && ' — bottom reached'}
      </Text>
      <Table
        className='h-500'
        data={data}
        columns={securityColumns}
        getRowId={row => row.id}
        virtualized='container'
        isLoading={isFetching}
        initialScrollToRowId={anchorId}
        onStartReached={fetchPrevPage}
        onStartReachedThreshold={200}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={200}
      />
    </VStack>
  );
};
```

- [ ] **Step 3: Verify the story renders**

Run: `pnpm storybook` (or the repo's Storybook script), open **Table → BidirectionalInfiniteScroll**.
Expected: table mounts centered on the anchor row; scrolling up loads older rows without a visible jump; scrolling down loads newer rows.

- [ ] **Step 4: Commit**

```bash
npx biome check --write src/components/Table/Table.stories.tsx
git add src/components/Table/Table.stories.tsx
git commit -m "docs(table): AS-1026 add bidirectional infinite scroll story"
```

---

## Task 14: E2E tests

**Files:**
- Modify: `src/components/Table/Table.e2e.ts`

> Read `docs/e2e-test-rules.md` and the existing `Table.e2e.ts` first to match the project's `test.describe` / Screenshot / Interaction / Accessibility structure and the story-loading helper used there.

- [ ] **Step 1: Add interaction tests**

Add a `test.describe('Table — BidirectionalInfiniteScroll', ...)` block following the existing file's structure and story-navigation helper. Cover:

```ts
// Pseudocode — adapt to the helpers/selectors already used in Table.e2e.ts.
// Story id: 'components-table--bidirectional-infinite-scroll'

// 1. Up loads older rows without a jump:
//    - navigate to the story; wait for the scroll container [data-table-scroll-container]
//    - record the anchor row's bounding box (a known cell text from the middle window)
//    - scroll the container to the top (scrollTop = 0) and wait for the new first row
//    - assert the anchor row's bounding box top moved by < a small tolerance (e.g. 4px)
//      i.e. the viewport did not jump while older rows were prepended

// 2. Down loads newer rows:
//    - scroll to the bottom; assert the rendered row count / last row id increased

// 3. Combined up-then-down keeps the table interactive (no error, rows present)
```

- [ ] **Step 2: Add a screenshot test**

Add a Screenshot test that navigates to the story, waits for the anchored window to settle, and captures the table container — matching the screenshot grouping/severity conventions already in `Table.e2e.ts`.

- [ ] **Step 3: Run E2E for the Table**

Run (from repo root, per the project's E2E command): the Playwright suite filtered to the Table spec.
Expected: new tests PASS. If running in CI with screenshot baselines, generate the baseline via the project's `[update-screenshots]` flow.

- [ ] **Step 4: Commit**

```bash
npx biome check --write src/components/Table/Table.e2e.ts
git add src/components/Table/Table.e2e.ts
git commit -m "test(table): AS-1026 e2e for bidirectional infinite scroll"
```

---

## Final verification

- [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit` — no errors.
- [ ] `pnpm exec vitest run src/components/Table` — all unit tests pass.
- [ ] `npx biome check src/components/Table` — clean.
- [ ] Storybook: top-down `InfiniteScroll` story still works (regression — downward scroll unchanged).
- [ ] Storybook: `BidirectionalInfiniteScroll` — anchored mount, jump-free up, working down.
- [ ] E2E Table suite passes (and screenshot baselines updated if needed).

## Spec coverage check

- Spec §3 public API → Task 9 (`onStartReached`, `onStartReachedThreshold`, `initialScrollToRowId`).
- Spec §4.1 `useScrollEdge` → Task 4. §4.2 prepend anchor → Task 5. §4.3 `getItemKey` → Task 10. §4.4 prepend-aware reset → Task 10. §4.5 initial-anchor arming → Task 6.
- Spec §4.6 FSD slice/`lib` extraction → Tasks 1–3, 7, 8.
- Spec §5 data flow → Tasks 12–13 (mock + story). §7 testing → Tasks 1,2,4,5,14.
- Spec §8 decisions → reflected in Tasks 4 (refactor not twin), 12–13 (loading on consumer side), 9 (`initialScrollToRowId`).
