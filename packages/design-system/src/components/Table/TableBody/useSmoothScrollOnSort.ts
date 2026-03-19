import { useEffect, useRef } from 'react';
import type { SortingState, Table as TanStackTable } from '@tanstack/react-table';

/**
 * Smooth-scrolls the table to the top when sorting changes.
 * Prevents the jarring jump that occurs when the virtualizer
 * recalculates row positions after a sort.
 */
export function useSmoothScrollOnSort<T>(
  table: TanStackTable<T>,
  getScrollTarget: () => HTMLElement | Window | null,
) {
  const prevSortingRef = useRef<SortingState>(table.getState().sorting);

  const sorting = table.getState().sorting;

  useEffect(() => {
    if (prevSortingRef.current === sorting) return;
    prevSortingRef.current = sorting;

    const target = getScrollTarget();
    if (!target) return;

    target.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sorting, getScrollTarget]);
}
