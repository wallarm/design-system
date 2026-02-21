import { type FC, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TABLE_VIRTUALIZATION_OVERSCAN } from './lib';
import { TBody, Td, Tr } from './primitives';
import { useTableContext } from './TableContext';
import { TableLoadingState } from './TableLoadingState';
import { TableRow } from './TableRow';

export const TableBodyVirtualized: FC = () => {
  const ctx = useTableContext();
  const { table, isLoading, estimateRowHeight, overscan } = ctx;
  const rows = table.getRowModel().rows;
  const parentRef = useRef<HTMLTableSectionElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current?.closest('[data-table-scroll-container]') ?? null,
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
  });

  const measureElement = virtualizer.measureElement;
  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <TBody ref={parentRef}>
      {virtualRows.length > 0 && (
        <Tr key='spacer-top'>
          <Td
            style={{ height: `${virtualRows[0]?.start ?? 0}px`, padding: 0, border: 'none' }}
            colSpan={table.getVisibleLeafColumns().length}
          />
        </Tr>
      )}
      {virtualRows.map(virtualRow => {
        const row = rows.at(virtualRow.index);

        if (row) {
          return (
            <TableRow key={row.id} row={row} data-index={virtualRow.index} ref={measureElement} />
          );
        }

        return null;
      })}
      {virtualRows.length > 0 && (
        <Tr key='spacer-bottom'>
          <Td
            style={{
              height: `${totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)}px`,
              padding: 0,
              border: 'none',
            }}
            colSpan={table.getVisibleLeafColumns().length}
          />
        </Tr>
      )}
      {isLoading && <TableLoadingState />}
    </TBody>
  );
};

TableBodyVirtualized.displayName = 'TableBodyVirtualized';
