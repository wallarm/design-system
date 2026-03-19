import { type FC, useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';
import { useTableContext } from '../TableContext';
import { TableBodyVirtualizedCore } from './TableBodyVirtualizedCore';
import { useSmoothScrollOnSort } from './useSmoothScrollOnSort';

/** Walk up the offsetParent chain to get absolute offset from document top. */
function getDocumentOffsetTop(el: HTMLElement): number {
  let offset = 0;
  let current: HTMLElement | null = el;
  while (current) {
    offset += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return offset;
}

export const TableBodyVirtualizedWindow: FC = () => {
  const { table, estimateRowHeight, overscan } = useTableContext();
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
    scrollMargin: tbodyRef.current ? getDocumentOffsetTop(tbodyRef.current) : 0,
  });

  useSmoothScrollOnSort(table, () => window);

  return <TableBodyVirtualizedCore tbodyRef={tbodyRef} virtualizer={virtualizer} />;
};

TableBodyVirtualizedWindow.displayName = 'TableBodyVirtualizedWindow';
