import type { FC, RefObject } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import { TBody, Td, Tr } from '../primitives';
import { useTableContext } from '../TableContext';
import { TableLoadingState } from '../TableLoadingState';
import { TableRow } from '../TableRow';

export interface TableBodyVirtualizedCoreProps {
  tbodyRef: RefObject<HTMLTableSectionElement | null>;
  virtualizer: Virtualizer<Window, Element> | Virtualizer<Element, Element>;
}

export const TableBodyVirtualizedCore: FC<TableBodyVirtualizedCoreProps> = ({
  tbodyRef,
  virtualizer,
}) => {
  const { table, isLoading } = useTableContext();
  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const measureElement = virtualizer.measureElement;
  const rows = table.getRowModel().rows;
  const colSpan = table.getVisibleLeafColumns().length;
  const scrollMargin = virtualizer.options.scrollMargin;

  return (
    <TBody ref={tbodyRef}>
      {virtualRows.length > 0 && (
        <Tr key='spacer-top'>
          <Td
            style={{
              height: `${(virtualRows[0]?.start ?? 0) - scrollMargin}px`,
              padding: 0,
              border: 'none',
            }}
            colSpan={colSpan}
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
            colSpan={colSpan}
          />
        </Tr>
      )}
      {isLoading && <TableLoadingState />}
    </TBody>
  );
};

TableBodyVirtualizedCore.displayName = 'TableBodyVirtualizedCore';
