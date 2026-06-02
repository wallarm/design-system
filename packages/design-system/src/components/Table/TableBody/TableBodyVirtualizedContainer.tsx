import { type FC, useCallback, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { getRowKey, TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';
import { useTableContext } from '../TableContext';
import { measureRowElement } from './lib/measureRowElement';
import { TableBodyVirtualizedCore } from './TableBodyVirtualizedCore';
import { useResetVirtualizerOnDataChange } from './useResetVirtualizerOnDataChange';
import { useSmoothScrollOnSort } from './useSmoothScrollOnSort';

export const TableBodyVirtualizedContainer: FC = () => {
  const { table, estimateRowHeight, overscan, tbodyRef, virtualizerRef } = useTableContext();

  const getScrollElement = useCallback(
    () => tbodyRef.current?.closest<HTMLElement>('[data-table-scroll-container]') ?? null,
    [tbodyRef],
  );

  const virtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement,
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
    getItemKey: useCallback((index: number) => getRowKey(table.getRowModel().rows, index), [table]),
    measureElement: measureRowElement,
  });

  // Publish to the table-level handle. Render-time assignment is safe — refs
  // don't trigger re-renders and the value is idempotent across renders.
  virtualizerRef.current = virtualizer;

  // Clear on unmount so any `scrollToRow` call landing between this body's
  // unmount and a successor body's first render doesn't act on a dead
  // virtualizer instance.
  useEffect(() => {
    return () => {
      virtualizerRef.current = null;
    };
  }, [virtualizerRef]);

  useResetVirtualizerOnDataChange(table, virtualizer);
  useSmoothScrollOnSort(table, getScrollElement);

  return <TableBodyVirtualizedCore tbodyRef={tbodyRef} virtualizer={virtualizer} />;
};

TableBodyVirtualizedContainer.displayName = 'TableBodyVirtualizedContainer';
