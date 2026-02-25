import { type FC, useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';
import { useTableContext } from '../TableContext';
import { TableBodyVirtualizedCore } from './TableBodyVirtualizedCore';

export const TableBodyVirtualizedWindow: FC = () => {
  const { table, estimateRowHeight, overscan } = useTableContext();
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
    scrollMargin: tbodyRef.current?.offsetTop ?? 0,
  });

  return <TableBodyVirtualizedCore tbodyRef={tbodyRef} virtualizer={virtualizer} />;
};

TableBodyVirtualizedWindow.displayName = 'TableBodyVirtualizedWindow';
