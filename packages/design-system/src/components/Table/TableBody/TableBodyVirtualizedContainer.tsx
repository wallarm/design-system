import { type FC, useCallback, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';
import { useTableContext } from '../TableContext';
import { TableBodyVirtualizedCore } from './TableBodyVirtualizedCore';
import { useSmoothScrollOnSort } from './useSmoothScrollOnSort';

export const TableBodyVirtualizedContainer: FC = () => {
  const { table, estimateRowHeight, overscan } = useTableContext();
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  const getScrollElement = useCallback(
    () => tbodyRef.current?.closest<HTMLElement>('[data-table-scroll-container]') ?? null,
    [],
  );

  const virtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement,
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
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

  useSmoothScrollOnSort(table, getScrollElement);

  return <TableBodyVirtualizedCore tbodyRef={tbodyRef} virtualizer={virtualizer} />;
};

TableBodyVirtualizedContainer.displayName = 'TableBodyVirtualizedContainer';
