import { type FC, useCallback, useEffect, useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';
import { useTableContext } from '../TableContext';
import { getDocumentOffsetTop } from './lib/getDocumentOffsetTop';
import { TableBodyVirtualizedCore } from './TableBodyVirtualizedCore';
import { useSmoothScrollOnSort } from './useSmoothScrollOnSort';

export const TableBodyVirtualizedWindow: FC = () => {
  const { table, estimateRowHeight, overscan } = useTableContext();
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
    scrollMargin: tbodyRef.current ? getDocumentOffsetTop(tbodyRef.current) : 0,
  });

  // Reset cached measurements when the data set changes so the virtualizer
  // does not retain stale heights from a previous data set.
  // Track first row ID to distinguish "new data" from "appended rows" (infinite scroll).
  const rows = table.getRowModel().rows;
  const firstRowId = rows[0]?.id;
  const prevFirstRowIdRef = useRef(firstRowId);
  useEffect(() => {
    if (prevFirstRowIdRef.current !== firstRowId) {
      prevFirstRowIdRef.current = firstRowId;
      virtualizer.measure();
    }
  }, [firstRowId, virtualizer]);

  const getScrollTarget = useCallback(() => window as Window, []);
  useSmoothScrollOnSort(table, getScrollTarget);

  return <TableBodyVirtualizedCore tbodyRef={tbodyRef} virtualizer={virtualizer} />;
};

TableBodyVirtualizedWindow.displayName = 'TableBodyVirtualizedWindow';
