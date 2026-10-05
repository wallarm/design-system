import { type CSSProperties, useCallback, useSyncExternalStore } from 'react';
import type { Column, RowData } from '@tanstack/react-table';
import { useTableContext } from '../TableContext/useTableContext';
import type { DSTableFeatures } from './dsTableFeatures';
import { isLastPinnedLeft } from './isLastPinnedLeft';

/*
 * React Compiler and TanStack Table v9
 * ------------------------------------
 * v9 keeps `row` / `column` / `header` / `cell` objects at a stable identity
 * while their getter results (`row.getIsSelected()`, `column.getIsSorted()`,
 * `header.getSize()`, ...) change. A compiled component that calls such a
 * getter in render memoizes the result against the unchanged object and keeps
 * rendering stale state. Only `table` itself (from `useTable`, shared through
 * the table context) is a new value whenever table state changes.
 *
 * Every getter read in a compiled Table component therefore goes through one
 * of the two helpers below, so the compiler sees an input that changes:
 *
 * - `useTableValue(() => getter())` for scalar reads — subscribes to the table
 *   store (the documented v9 pattern, `useSelector(table.store, selector)`).
 * - `withTableState(table.state, () => ...)` for internal output that cannot
 *   be compared by value: lists whose items read getters.
 *
 * Consumer callbacks (`cell` / function `header` renderers,
 * `renderMenuAction`, `renderExpandedRow`) go through `useRenderEveryTime`
 * instead: they may call hooks, so they must never be cached.
 */

/**
 * Reactive read of a TanStack Table getter.
 *
 * `read` runs on every render and on every table store change, and its result
 * is a hook value — a real reactive input for compiled code. It must return a
 * primitive or a reference TanStack itself memoizes (`row.getVisibleCells()`,
 * `table.getVisibleLeafColumns()`, `table.getRowModel().rows`, ...): the value
 * is compared with `Object.is`, so a freshly allocated object never settles.
 */
export const useTableValue = <V>(read: () => V): V => {
  const { table } = useTableContext<RowData>();
  const { store } = table;

  const subscribe = useCallback(
    (onStoreChange: () => void) => store.subscribe(() => onStoreChange()).unsubscribe,
    [store],
  );

  return useSyncExternalStore(subscribe, read, read);
};

/**
 * Runs `compute` as a function of the table's React-facing state snapshot
 * (`table.state`, a new object on every state change).
 *
 * `state` is not read at runtime: it is an input of this call, so a compiled
 * caller re-runs `compute` whenever the table state changes instead of reusing
 * a value it memoized against a stable `cell` / `row` / `column`. Use it for
 * internal values that cannot go through `useTableValue` — lists whose items
 * read getters. Never for consumer callbacks: those may call hooks and go
 * through `useRenderEveryTime`.
 */
export const withTableState = <V>(_state: unknown, compute: () => V): V => compute();

interface ColumnPinning {
  isPinned: false | 'start' | 'end';
  /** Sticky positioning for a start-pinned column, `{}` otherwise. */
  pinningStyles: CSSProperties;
  /** The column is the last of the start-pinned group (draws the pinned edge shadow). */
  lastPinnedLeft: boolean;
}

/** Reactive pinning state of a column, shared by header and body cells. */
export const useColumnPinning = <T extends RowData>(
  column: Column<DSTableFeatures, T, unknown>,
): ColumnPinning => {
  const { allLeafColumns } = useTableContext<T>();

  const isPinned = useTableValue(() => column.getIsPinned());
  const start = useTableValue(() =>
    column.getIsPinned() === 'start' ? column.getStart('start') : 0,
  );
  const lastPinnedLeft = useTableValue(() => isLastPinnedLeft(column, allLeafColumns, column.id));

  const pinningStyles: CSSProperties =
    isPinned === 'start' ? { left: `${start}px`, position: 'sticky' } : {};

  return { isPinned, pinningStyles, lastPinnedLeft };
};
