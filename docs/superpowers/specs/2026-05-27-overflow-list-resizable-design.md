# AS-1033 — OverflowList in resizable containers

**Date:** 2026-05-27
**Ticket:** [AS-1033](https://wallarm.atlassian.net/browse/AS-1033)
**Status:** design approved

## Problem

`OverflowList` (via the `useOverflowItems` hook) must reflow correctly and
smoothly when the container width changes in real time: inside a resizable
drawer (`DrawerResizeHandle`) and in a resizable table column cell (TanStack
column resizing). Today, dragging the resize handle makes the UI "freeze".

## Root causes

| # | Where | Problem |
|---|-----|----------|
| 1 | `hooks/useOverflowItems.tsx:84-109` | On **every tick** of `ResizeObserver`, a temporary DOM node is created/inserted/removed inside the loop (`document.createElement` → `appendChild` → reading `offsetWidth` → `removeChild`). The forced synchronous reflow on every drag frame is the main source of lag. |
| 2 | `hooks/useOverflowItems.tsx:131` | The `ResizeObserver` callback runs synchronously many times per second and calls `setState`, which triggers a new layout, which is again observed by the RO. There is no batching via `requestAnimationFrame` — risk of the "ResizeObserver loop completed with undelivered notifications" warning. |
| 3 | `hooks/useOverflowItems.tsx:64` | `getComputedStyle(container)` on every tick — an unnecessary forced style recalc. |
| 4 | `components/OverflowList/OverflowList.tsx:39,47` | `items.indexOf(item)` is called in the renderer for every item → O(n²) per render. |
| 5 | `components/OverflowList/OverflowList.tsx:78-82` | `useMemo` is used as a side-effect for `onOverflow` — unsafe in React 19 (it runs during render). |
| 6 | `hooks/useOverflowItems.tsx:144` | `MeasurementContainer` is an inline component, recreated on every render. |

## Approach

Chosen: **optimize the current engine** (hidden measurement layer +
`ResizeObserver`), without switching to IntersectionObserver.

Principles (best practices from the research — see "Sources"):
- **Separate read and write**: inside the resize callback — only reads/arithmetic
  against the cache, no DOM creation/removal.
- **rAF batching**: move all work out of the `ResizeObserver` callback into a single
  `requestAnimationFrame`, coalescing multiple frame notifications into one pass.
- **Measurement cache**: item widths, gap, and the `+N` indicator width are measured
  once (when `items`/renderers change), not on every resize tick.

### Changes in `useOverflowItems`

1. **Measure the indicator via the measurement layer**, not a temp DOM node. Render
   the overflow indicator in a hidden container with its own ref and measure its
   `offsetWidth` once. The entire `document.createElement` block (lines ~84-109)
   is removed.
2. **Measurement cache**: item widths + gap + indicator width are stored in a ref;
   recompute only when `items`/renderers change.
3. **rAF throttling of `ResizeObserver`**: the callback schedules a single
   `requestAnimationFrame` that runs `calculateVisibleItems`; the pending rAF is
   cancelled in cleanup. This is the documented fix for both jank and the
   "ResizeObserver loop" warning.
4. **Read gap once** during the measurement phase, not on every tick.
5. **Guard on setState**: `setVisibleCount` is called only if the value actually
   changed — fewer re-renders and no RO feedback loop.
6. Stabilize `MeasurementContainer` via `useCallback`.

### Changes in `OverflowList`

1. An `item → index` map via `useMemo` (or a direct `map` over indices) instead of
   `indexOf` — removes the O(n²).
2. Move `onOverflow` from `useMemo` into `useEffect`.
3. The overflow indicator is passed to the hook for measurement via the already
   existing `overflowRenderer`.

### API compatibility

The public signatures of `OverflowListProps` and `useOverflowItems` **do not change**.
`reserveSpace` becomes a fallback floor (used until the real indicator is measured,
or when `overflowRenderer` is not provided). Existing consumers —
`Attribute`, `SelectInput` — keep working without changes.

## Demo (Storybook)

- **Drawer** (`Drawer.stories.tsx`): a new `ResizableWithOverflowList` story — a
  drawer with `DrawerResizeHandle`, with an `Attribute` containing an `OverflowList`
  of tags in its body; dragging the handle actually reflows the list.
- **Table** (`Table.stories.tsx`): a new `ColumnResizingWithOverflowList` story — a
  column whose cell renders an `OverflowList` over `row.original.tags` (the tag set
  is extended in `mocks.tsx` to make the overflow visible), with column resizing
  enabled.
- **OverflowList** (new file `OverflowList.stories.tsx`): `Basic`,
  `CollapseFromStart`, `MinVisibleItems`, and `ResizableContainer` (a wrapper with CSS
  `resize: horizontal`) for a standalone demo of live reflow.

## Tests

- **Component (Vitest + Testing Library)**: logic with mocked `offsetWidth` and
  `ResizeObserver` — correctness of the index map, `minVisibleItems`, and that
  `onOverflow` fires via `useEffect`.
- **E2E (Playwright)** per the `docs/e2e-test-rules.md` rules:
  - standalone resizable story: shrink the container → `+N` appears, hiddenCount
    grows; widen it → items come back;
  - drag the drawer handle → reflow;
  - drag the table column resize → cell reflow;
  - visual screenshots of narrow/wide states.

## Acceptance criteria

1. Dragging the drawer resize handle and the table column shows no visible freezes;
   no DOM is created/removed inside the resize callback.
2. `OverflowList` correctly collapses/expands items when the container width changes
   in both directions.
3. No O(n²) and no side-effect in `useMemo`.
4. Demo stories added to Drawer, Table, and a separate `OverflowList.stories.tsx`.
5. Component and E2E tests are green; lint/typecheck without errors.

## Sources (performance research)

- [MDN — ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [Avoiding pitfalls with the resize event (OpenReplay)](https://blog.openreplay.com/avoiding-resize-event-pitfalls-js/)
- [TrackJS — Fix `ResizeObserver loop limit exceeded`](https://trackjs.com/javascript-errors/resizeobserver-loop-limit-exceeded/)
