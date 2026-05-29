# Bidirectional Infinite Scroll in Table

**Date:** 2026-05-29
**Status:** Design approved, ready for implementation plan
**Component:** `packages/design-system/src/components/Table`

## 1. Goal and Principles

Add upward row loading (via a new `prev_cursor` endpoint parameter) symmetric to the existing
downward loading (`next_cursor`). Additionally — open the table around an arbitrary anchor row and
scroll in both directions without viewport "jumps".

Data and cursors remain on the application side (consumer-managed, as today). The Table is only
responsible for:
- detecting proximity to an edge (top/bottom);
- scroll anchoring when rows are prepended;
- positioning the initial anchor row.

Saving/restoring cursors (URL/storage) is on the application side.

## 2. Context and Current Implementation

- Stack: **TanStack Table 8.21.3** + **TanStack Virtual 3.13.18**. No TanStack Query — fetching is
  entirely consumer-driven.
- Downward scroll: the `hooks/useEndReached.ts` hook listens to `scroll` and calls `onEndReached`
  when `distanceToBottom <= threshold`. The consumer appends rows to `data` itself.
- The virtualizers (`TableBody/TableBodyVirtualizedContainer.tsx`,
  `TableBodyVirtualizedWindow.tsx`) **do not set `getItemKey`** → keys are index-based.
- `TableBody/useResetVirtualizerOnDataChange.ts` calls `virtualizer.measure()` on any change of the
  first row id.
- The imperative handle `TableHandle.scrollToRow(id, opts)` already exists.

### Library decision

The native TanStack Virtual options `anchorTo: 'end'` / `followOnAppend` only appeared in
`@tanstack/virtual-core@3.16.0` (our `@tanstack/react-virtual@3.13.18` doesn't have them) and are
built for always-end-anchored feeds (chats/logs). Our case is bidirectional scroll with an arbitrary
anchor, so we chose **manual scroll anchoring on the current version** with no dependency upgrade.
`@ark-ui/react` is not used in Table and is unrelated to scrolling.

## 3. Public API (additions to `TableProps<T>`)

```ts
// --- Infinite scroll (bidirectional) ---
/** Called when the user scrolls near the start (top) of the table */
onStartReached?: () => void
/** Distance from the top (px) to trigger onStartReached (default: 200) */
onStartReachedThreshold?: number

// existing — unchanged:
onEndReached?: () => void
onEndReachedThreshold?: number

/**
 * Row id to anchor the initial scroll position to. When set, the table scrolls this row into view
 * on mount and arms the edge detectors only AFTER that initial scroll has settled. For deep-linking
 * into the middle of a dataset with bidirectional loading.
 */
initialScrollToRowId?: string
```

The behavior of `onEndReached` / `onEndReachedThreshold` / `scrollToRow(id)` does not change.
`TableContextValue<T>` is extended symmetrically (`onStartReached`, `onStartReachedThreshold`,
`initialScrollToRowId`), and `TableProvider` threads them into the context.

## 4. Internal Architecture

### 4.1. Edge detection — refactor `useEndReached` → `useScrollEdge`

Generalize `useEndReached.ts` into `useScrollEdge({ edge: 'start' | 'end', mode, scrollRef, onReached, threshold })`:
- `edge: 'end'` — as today: `distanceToBottom <= threshold`.
- `edge: 'start'` — `scrollTop <= threshold`; re-arm at `scrollTop > threshold`.
- Same cooldown guard (`SCROLL_EDGE_COOLDOWN_MS`, see 4.6) and latest-callback ref.

Within the slice it is called twice (for `start` and `end`); externally it is wrapped by the
`useInfiniteScroll` orchestrator (see 4.6), which `TableInnerContainer` / `TableInnerWindow` consume.

### 4.2. Scroll anchoring on prepend — new hook `usePrependScrollAnchor`

The main part. In a `useLayoutEffect` (before paint, no flicker):
- keep `prevFirstRowId` and `prevScrollHeight` in refs, updated at the end of each layout effect;
- if the first row id changed **and** the previous first row is still present in the new set → it's
  a prepend (not a full replacement);
- compute `delta = newScrollHeight − prevScrollHeight` and compensate:
  - container: `scrollEl.scrollTop += delta`;
  - window: `window.scrollBy(0, delta)`.

Uses the actual `scrollHeight`, so it is robust against row-height estimate errors.

### 4.3. `getItemKey` on the virtualizers

Add to `TableBodyVirtualizedContainer` and `TableBodyVirtualizedWindow`:
```ts
getItemKey: useCallback(
  (index) => table.getRowModel().rows[index]?.id ?? index,
  [table],
)
```
Without this, the measurement cache is keyed by index and gets mismatched on prepend.

### 4.4. `useResetVirtualizerOnDataChange` — prepend-aware

Distinguish:
- the previous first row **disappeared** from the set → new dataset → `virtualizer.measure()` (as today);
- the previous first row **shifted down** (still present) → prepend → keep measurements, hand off to
  the anchoring hook.

### 4.5. Arming with `initialScrollToRowId`

When the prop is set:
- suppress the immediate on-mount `check()` in `useScrollEdge`;
- scroll to the row via `virtualizer.scrollToIndex` (or `scrollToRow`);
- `readyRef` flips to `true` on the next frame; edge detectors fire only after that.

Otherwise, at mount (`scrollTop = 0`) `onStartReached` would fire immediately.

## 4.6. File organization (FSD check)

There is no explicit FSD config in the repo, but Table already follows a layered structure with
one-directional dependencies and a public API via `index.ts` barrels. The new logic fits the same
model and is itself checked against FSD principles: high cohesion within a slice, low coupling
between slices, imports only "downward".

### Layers and dependency direction (top to bottom, imports only downward)
```
Table.tsx / TableProvider      (root — assembles everything)
  └─ TableInner/* , TableBody/* (consume hooks and lib)
       └─ hooks/infiniteScroll/* (feature logic; depends only on lib + react + virtual-core types)
            └─ lib/*             (pure helpers and constants; no imports from components/hooks)
                 └─ primitives/* (TBody/Td/Tr/...)
```
Forbidden: `hooks/` and `lib/` do not import from `TableInner`/`TableBody`/root — the elements and
values they need are passed as arguments (refs, callbacks). The slice's internal files are not
re-exported outside Table — the public surface is only the props in the root `index.ts`.

### Folder grouping: `hooks/infiniteScroll/`
All feature logic is cohesive → grouped into one slice folder with a single public export:
```
hooks/infiniteScroll/
  useInfiniteScroll.ts        # orchestrator: composite start/end + anchor + initial-anchor
  useScrollEdge.ts            # edge detection (refactor of useEndReached, edge: 'start' | 'end')
  usePrependScrollAnchor.ts   # scrollTop delta compensation on prepend
  useInitialAnchor.ts         # initialScrollToRowId: scrollToIndex + arming (readyRef)
  types.ts                    # slice-local types
  index.ts                    # re-exports only useInfiniteScroll
```
Instead of two direct `useEndReached` calls, `TableInnerContainer` and `TableInnerWindow` call a
single `useInfiniteScroll({ mode, scrollRef, ... })` — this removes duplication and hides the
internal hooks. `hooks/index.ts` exports `useInfiniteScroll` (instead of `useEndReached`).

### Extraction into `lib/` (pure, reusable units)
- `lib/constants.ts`: add `TABLE_START_REACHED_THRESHOLD = 200` (mirror of
  `TABLE_END_REACHED_THRESHOLD`) and extract the cooldown out of the hook into
  `SCROLL_EDGE_COOLDOWN_MS = 200` (currently a local `COOLDOWN_MS` inside `useEndReached`).
- `lib/detectDataChange.ts`: pure predicate `detectDataChange(prevFirstRowId, rows): 'prepend' |
  'replace' | 'none'`. Single source for the "prepend vs full replacement" logic — used by both
  `usePrependScrollAnchor` (4.2) and `useResetVirtualizerOnDataChange` (4.4); removes detection
  duplication. (`append` and "no change" collapse into `'none'` — no consumer distinguishes them.)
- `lib/getRowKey.ts`: helper `getRowKey(rows, index)` for `getItemKey` (4.3) — shared by both
  virtualizers instead of inlining in two places.

Everything new is exported via the corresponding `index.ts` files (`lib/index.ts`, `hooks/index.ts`,
`hooks/infiniteScroll/index.ts`).

### Components
No new components are needed: the top loading indicator is on the consumer side (section 8.2),
skeletons reuse the existing `TableLoadingState`. If a top-loader is needed in the future, it should
be added as a separate component in the Table folder, not inlined.

### Comments
Minimal and concise: a short one-line JSDoc on each new hook/helper (like the current
`useEndReached`, `constants.ts`), no per-line comments and no describing the obvious. Explain only
the non-obvious (e.g. why `useLayoutEffect`, why the latest-callback ref).

## 5. Data Flow

### Top-down (unchanged)
First page → scroll down → `onEndReached` → consumer appends via `next_cursor`.

### Deep-link bidirectional
1. Consumer loads a window around the anchor (using `prev_cursor` and `next_cursor` relative to the anchor).
2. Passes `data` + `initialScrollToRowId={anchorId}`.
3. The table scrolls to the anchor and arms the detectors.
4. Scroll up → `onStartReached` → consumer prepends the older page (`prev_cursor`) → the anchor hook
   compensates `scrollTop`, no jump.
5. Scroll down → `onEndReached` → append (`next_cursor`).

## 6. Edge Cases

- Dataset smaller than the viewport (both edges at once): cooldown + re-arm + consumer guards
  `hasPrev`/`hasNext` prevent a call loop.
- Sorting/filter change = full dataset replacement → reset path (see 4.4), scroll to top, detectors
  re-arm.
- Non-virtualized mode: the anchor hook works on the scroll container; `getItemKey` is not applicable.
- Window mode: compensation via window position, accounting for content above the table; the main
  tested path is `container`.

## 7. Testing

- **Unit (Vitest):**
  - `lib/detectDataChange`: pure predicate — the main carrier of the prepend/replace/append/none logic.
  - `useScrollEdge`: fire/re-arm/cooldown for `start` and `end`.
  - `usePrependScrollAnchor`: `scrollTop` compensation delta math.
  - `useResetVirtualizerOnDataChange`: reset (replace) vs prepend via `detectDataChange`.
- **E2E (Playwright)** — `Table.e2e.ts`:
  - New story `BidirectionalInfiniteScroll` + `useBidirectionalData` in `mocks.tsx` (exposes
    prev/next cursors, `fetchPrevPage` / `fetchNextPage`, `initialAnchor`).
  - Scenarios: scrolling up loads older rows without a jump (the anchor row stays in the viewport),
    scrolling down loads newer rows, combined.
  - Visual screenshots.

## 8. Decisions on Open Questions

1. Refactor `useEndReached` → parameterized `useScrollEdge` (instead of a twin hook), so the
   start/end logic does not drift.
2. Top loading indicator — on the consumer side (YAGNI); its height is included in the `scrollHeight`
   delta, so anchoring stays correct.
3. `initialScrollToRowId` is added as a new prop — it cleanly resolves the arming race, without
   relying on the timing of the imperative `scrollToRow`.

## 9. Out of Scope

- Saving/restoring cursors in URL/storage (application side).
- Upgrading `@tanstack/react-virtual` / native `anchorTo`.
- Horizontal infinite scroll.
