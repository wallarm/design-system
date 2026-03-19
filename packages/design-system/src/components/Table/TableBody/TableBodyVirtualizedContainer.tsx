import { type FC, useCallback, useRef } from 'react';
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

  useSmoothScrollOnSort(table, getScrollElement);

  return <TableBodyVirtualizedCore tbodyRef={tbodyRef} virtualizer={virtualizer} />;
};

TableBodyVirtualizedContainer.displayName = 'TableBodyVirtualizedContainer';
