import { type FC, useCallback } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';
import { useTableContext } from '../TableContext';
import { getDocumentOffsetTop } from './lib/getDocumentOffsetTop';
import { TableBodyVirtualizedCore } from './TableBodyVirtualizedCore';
import { useResetVirtualizerOnDataChange } from './useResetVirtualizerOnDataChange';
import { useSmoothScrollOnSort } from './useSmoothScrollOnSort';

export const TableBodyVirtualizedWindow: FC = () => {
  const { table, estimateRowHeight, overscan, tbodyRef, virtualizerRef } = useTableContext();

  const virtualizer = useWindowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
    scrollMargin: tbodyRef.current ? getDocumentOffsetTop(tbodyRef.current) : 0,
  });

  // Publish to the table-level handle. Render-time assignment is safe — refs
  // don't trigger re-renders and the value is idempotent across renders.
  virtualizerRef.current = virtualizer;

  useResetVirtualizerOnDataChange(table, virtualizer);

  const getScrollTarget = useCallback(() => window as Window, []);
  useSmoothScrollOnSort(table, getScrollTarget);

  return <TableBodyVirtualizedCore tbodyRef={tbodyRef} virtualizer={virtualizer} />;
};

TableBodyVirtualizedWindow.displayName = 'TableBodyVirtualizedWindow';
