import { useEffect, useRef } from 'react';
import type { ReactTable, RowData, SortingState } from '@tanstack/react-table';
import type { DSTableFeatures } from '../lib';

/**
 * Smooth-scrolls the table to the top when sorting changes.
 * Prevents the jarring jump that occurs when the virtualizer
 * recalculates row positions after a sort.
 */
export const useSmoothScrollOnSort = <T extends RowData>(
  table: ReactTable<DSTableFeatures, T>,
  getScrollTarget: () => HTMLElement | Window | null,
) => {
  const prevSortingRef = useRef<SortingState>(table.state.sorting);

  const sorting = table.state.sorting;

  useEffect(() => {
    if (prevSortingRef.current === sorting) return;
    prevSortingRef.current = sorting;

    const target = getScrollTarget();
    if (!target) return;

    target.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sorting, getScrollTarget]);
};
