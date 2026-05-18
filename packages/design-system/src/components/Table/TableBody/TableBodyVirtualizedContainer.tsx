import { type FC, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';
import { useTableContext } from '../TableContext';
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
  });

  // Publish to the table-level handle. Render-time assignment is safe — refs
  // don't trigger re-renders and the value is idempotent across renders.
  virtualizerRef.current = virtualizer;

  useResetVirtualizerOnDataChange(table, virtualizer);
  useSmoothScrollOnSort(table, getScrollElement);

  return <TableBodyVirtualizedCore tbodyRef={tbodyRef} virtualizer={virtualizer} />;
};

TableBodyVirtualizedContainer.displayName = 'TableBodyVirtualizedContainer';
