import { type CSSProperties, useSyncExternalStore } from 'react';
import { useTableContext } from '../TableContext/useTableContext';

const NONE: CSSProperties = {};

/**
 * A column's drag style, written by its header cell and read by its body
 * cells. Only the header registers the column with dnd-kit: dnd-kit keeps one
 * node per id, so a body cell registering the same id and then unmounting (a
 * virtualized row, a refetched page) dropped the column, and it no longer moved.
 */
export const createColumnDndStyles = () => {
  const styles = new Map<string, CSSProperties>();
  const listeners = new Set<() => void>();
  return {
    get: (id: string) => styles.get(id) ?? NONE,
    set: (id: string, style: CSSProperties) => {
      if (JSON.stringify(styles.get(id) ?? NONE) === JSON.stringify(style)) return;
      styles.set(id, style);
      for (const listener of listeners) listener();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export type ColumnDndStyles = ReturnType<typeof createColumnDndStyles>;

/** The drag style of the column, as its header cell has it. */
export const useColumnDndStyle = (columnId: string): CSSProperties => {
  const { columnDndStyles } = useTableContext();
  return useSyncExternalStore(
    columnDndStyles.subscribe,
    () => columnDndStyles.get(columnId),
    () => NONE,
  );
};
