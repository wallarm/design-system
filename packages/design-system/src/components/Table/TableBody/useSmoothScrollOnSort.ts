import { useEffect, useRef } from 'react';
import type { Table as TanStackTable } from '@tanstack/react-table';

/**
 * Smooth-scrolls the table to the top when sorting changes.
 * Prevents the jarring jump that occurs when the virtualizer
 * recalculates row positions after a sort.
 */
export function useSmoothScrollOnSort<T>(
  table: TanStackTable<T>,
  getScrollTarget: () => HTMLElement | Window | null,
) {
  const prevSortingRef = useRef(table.getState().sorting);

  useEffect(() => {
    const currentSorting = table.getState().sorting;

    if (prevSortingRef.current === currentSorting) return;
    prevSortingRef.current = currentSorting;

    const target = getScrollTarget();
    if (!target) return;

    if (target instanceof Window) {
      target.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      target.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
