# AS-950: Table imperative `scrollToRow` API

## Motivation

The Wallarm cloud-console attacks page implements share-links that open a specific attack row. When the linked row is below the currently rendered virtual window, the consumer must call `virtualizer.scrollToIndex(index)` — but the DS `Table` does not expose its virtualizer.

The current consumer-side workaround (`src/pages/attacks-new/ui/attacks-table/model/hooks/use-scroll-to-cursored-row.ts`) walks the React fiber tree from `<tbody>` upward to locate the TanStack `Virtualizer` via `memoizedProps`, then calls `scrollToIndex`. This is fragile:

- Reaches into private React internals (`__reactFiber` keys, `memoizedProps`).
- Couples the consumer to a specific TanStack version and to the internal prop name `virtualizer`.
- Silently breaks on any DS Table refactor.

A first-party imperative API on `Table` removes the fiber walk and gives every consumer (not just attacks) a supported way to scroll programmatically.

## Public API

```ts
// packages/design-system/src/components/Table/types.ts

export interface TableScrollToRowOptions {
  /** Alignment within the viewport. Default: 'auto'. */
  align?: 'start' | 'center' | 'end' | 'auto';
  /** Scroll behavior. Default: 'auto'. */
  behavior?: 'auto' | 'smooth';
}

export interface TableHandle {
  /**
   * Scrolls to the row with the given id.
   * Returns `true` if the row was found in the current row model and a scroll
   * was initiated. Returns `false` if the id is not in the current rows or the
   * virtualizer is not yet mounted — the caller decides whether to load more
   * pages or retry on the next frame.
   */
  scrollToRow(id: string, opts?: TableScrollToRowOptions): boolean;
}
```

Usage:

```tsx
const tableRef = useRef<TableHandle>(null);

<Table<T> ref={tableRef} ... />;

// later, e.g. after pages load:
const ok = tableRef.current?.scrollToRow(rowId, { align: 'auto' });
```

The method is intentionally synchronous and boolean-returning rather than a Promise — consumers already drive retry loops via `requestAnimationFrame` or `useEffect` dependencies, and a Promise-based API forces them to deal with cancellation when the row data shifts.

## Implementation

### 1. Context refs

`TableContext` gains two mutable refs, both nullable until populated by the body component on mount:

- `virtualizerRef: MutableRefObject<Virtualizer<any, any> | null>`
- `tbodyRef: MutableRefObject<HTMLTableSectionElement | null>`

Both are created in `TableProvider` with `useRef(null)`, exposed via the context value. They never trigger a re-render.

### 2. Body components write to the refs

`TableBodyVirtualizedWindow` and `TableBodyVirtualizedContainer` currently own their own `virtualizer` (from `useWindowVirtualizer` / `useVirtualizer`) and a local `tbodyRef`. After this change:

- They read `virtualizerRef` and `tbodyRef` from context instead of declaring local refs.
- They assign `virtualizerRef.current = virtualizer` in an effect (or directly during render — see "Render vs effect" below).
- `tbodyRef` from context is passed straight to `TableBodyVirtualizedCore`.

Non-virtualized `TableBody` writes only `tbodyRef.current`; `virtualizerRef.current` stays `null`. That signals the `scrollToRow` fallback path.

#### Render vs effect

The virtualizer instance is stable across renders for a given mount of the body component, but TanStack returns a fresh wrapper if `count` changes. Writing `virtualizerRef.current = virtualizer` during render (not in an effect) is safe — it's an idempotent assignment of a ref, no React rule violated — and means `scrollToRow` works on the first render of the body, not the second. We will use the render-time assignment.

### 3. Row id attribute

`TableRow` adds `data-row-id={row.id}` to its `<Tr>`. This serves two purposes:

- The non-virtualized fallback in `scrollToRow` resolves the DOM node by this attribute.
- It is a stable, supported hook for e2e tests and external code (no commitment beyond that — the attribute name becomes part of the public surface).

### 4. Ref as a prop on `Table`

DS uses React 19 (`"react": "^19.0.0"`), where `ref` is a regular prop — `forwardRef` is no longer needed. `Table` stays a plain generic function component; `TableProps<T>` gains an optional `ref?: Ref<TableHandle>` field.

The imperative handle cannot be wired in `Table` itself because the context is not yet provided at that level. A tiny `TableImperativeBridge` mounted inside `TableProvider` takes the forwarded ref, reads `table` / `virtualizerRef` / `tbodyRef` from context, and calls `useImperativeHandle(ref, () => ({ scrollToRow }), [])`. It renders `null`. `TableProvider` itself stays unaware of the imperative API.

```tsx
export const Table = <T,>(props: TableProps<T>) => {
  const { ref, /* ...rest, same destructuring as today */ } = props;
  // ...
  return (
    <TableProvider data={data} isLoading={isLoading} {...providerProps}>
      {ref ? <TableImperativeBridge handleRef={ref} /> : null}
      <TestIdProvider value={testId}>
        <TableInner ...>{children}</TableInner>
      </TestIdProvider>
    </TableProvider>
  );
};
```

### 5. `scrollToRow` algorithm

```ts
const scrollToRow: TableHandle['scrollToRow'] = (id, opts = {}) => {
  const rows = table.getRowModel().rows;
  const index = rows.findIndex(r => r.id === id);
  if (index < 0) return false;

  const v = virtualizerRef.current;
  if (v) {
    v.scrollToIndex(index, {
      align: opts.align ?? 'auto',
      behavior: opts.behavior,
    });
    return true;
  }

  const tbody = tbodyRef.current;
  const el = tbody?.querySelector(`[data-row-id="${CSS.escape(id)}"]`);
  if (!(el instanceof HTMLElement)) return false;
  el.scrollIntoView({
    block:
      opts.align === 'center'
        ? 'center'
        : opts.align === 'start'
          ? 'start'
          : opts.align === 'end'
            ? 'end'
            : 'nearest',
    behavior: opts.behavior,
  });
  return true;
};
```

`CSS.escape` is required because attack-rows in the consumer use composite ids containing `:` (e.g. `"abc123:source_ip:1.2.3.4"`).

## Edge cases

- **Virtualizer not yet mounted on first render.** `virtualizerRef.current` is `null` until the body renders for the first time. `scrollToRow` returns `false`; consumer retries on the next frame or after data settles. Documented in the JSDoc.
- **Row not in current `rows`.** Returns `false`. The DS does not assume anything about pagination — callers (like attacks-new) own that loop.
- **Row outside virtualized window.** TanStack `scrollToIndex` handles this — that is its entire purpose.
- **Data churns between `scrollToRow` call and TanStack measuring.** TanStack queues the scroll and applies it once measurement settles. No special handling required.
- **`virtualized` mode switched at runtime.** The ref simply becomes `null` again when the non-virt body mounts; fallback path kicks in. No leak — old virtualizer is GC'd with its mount.
- **SSR.** `CSS.escape` is browser-only; the function only runs in event handlers / refs / effects, so SSR is unaffected.

## Out of scope (for this spec)

- `getRowIndex(id)`, `getVirtualizer()`, `scrollToIndex(index, opts)` on the handle — YAGNI; can be added behind the same `TableHandle` interface later without breakage.
- Declarative `scrollToRow={{ id, align }}` prop — current consumer pattern is naturally imperative (retry loops, side effects); adding declarative form would just duplicate surface area.
- Updating the attacks-new consumer to use the new API — separate PR after the DS release that ships this API. The consumer keeps its fiber-walk fallback until then.
- Unit / regression tests inside DS — per user preference for DS-side changes, verification is via the new Storybook story plus manual smoke; tests in the consumer repo cover the integrated behavior.

## Files touched

- `packages/design-system/src/components/Table/types.ts` — `TableHandle`, `TableScrollToRowOptions` exports; widen `TableProps` to allow `ref`.
- `packages/design-system/src/components/Table/Table.tsx` — destructure `ref` from props, mount `TableImperativeBridge` inside `TableProvider`.
- `packages/design-system/src/components/Table/TableImperativeBridge.tsx` — new file; reads context, calls `useImperativeHandle`.
- `packages/design-system/src/components/Table/TableContext/types.ts` — add `virtualizerRef`, `tbodyRef`, and the `TableVirtualizerInstance` union to the context type.
- `packages/design-system/src/components/Table/TableContext/TableProvider.tsx` — create the refs.
- `packages/design-system/src/components/Table/TableBody/TableBodyVirtualizedWindow.tsx` — use context refs; write virtualizer.
- `packages/design-system/src/components/Table/TableBody/TableBodyVirtualizedContainer.tsx` — same.
- `packages/design-system/src/components/Table/TableBody/TableBody.tsx` — non-virt: write `tbodyRef`.
- `packages/design-system/src/components/Table/TableRow.tsx` — add `data-row-id`.
- `packages/design-system/src/components/Table/Table.stories.tsx` — new "Scroll to row" story.
- `packages/design-system/src/components/Table/TABLE_DESIGN.md` — documented imperative API section.
- `packages/design-system/src/components/Table/index.ts` — re-export `TableHandle`, `TableScrollToRowOptions`.

## Release

Minor bump (additive public API). Conventional-commit message:

```
feat(table): AS-950 expose scrollToRow imperative handle
```

(Scope `table` is lowercase per repo commitlint config.)

## Follow-up (separate ticket / PR in the cloud-console repo)

Once DS ships this version, in `wallarm-cloud-console`:

1. Bump `@wallarm-org/design-system` to the new version.
2. Replace the fiber-walk in `src/pages/attacks-new/ui/attacks-table/model/hooks/use-scroll-to-cursored-row.ts` with `tableRef.current?.scrollToRow(targetId, { align: 'auto' })`.
3. Keep the retry loop (next-frame attempts) — `false` return signals "try again".
4. Drop `findVirtualizer` and the `[data-preview-active="true"]` `scrollIntoView` nudge (no longer needed since DS does alignment).
