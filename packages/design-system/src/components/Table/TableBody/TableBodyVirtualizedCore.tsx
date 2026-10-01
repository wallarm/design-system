// React Compiler opt-out: `virtualizer` is a mutable @tanstack/react-virtual
// instance (a known React Compiler-incompatible library) passed in as a prop;
// getVirtualItems()/getTotalSize() must be re-read on every render.
'use no memo';

import type { FC, RefObject } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import { useTestId } from '../../../utils/testId';
import { TABLE_PREPEND_SKELETON_ROWS } from '../lib';
import { TBody, Td, Tr } from '../primitives';
import { useTableContext } from '../TableContext';
import { TableLoadingState } from '../TableLoadingState';
import { TableRow } from '../TableRow';
import { TableBodyRowDndContext } from './TableBodyRowDndContext';

export interface TableBodyVirtualizedCoreProps {
  tbodyRef: RefObject<HTMLTableSectionElement | null>;
  virtualizer:
    | Virtualizer<Window, Element>
    | Virtualizer<HTMLElement, Element>
    | Virtualizer<Element, Element>;
}

export const TableBodyVirtualizedCore: FC<TableBodyVirtualizedCoreProps> = ({
  tbodyRef,
  virtualizer,
}) => {
  const { table, isLoading, isLoadingPrevious } = useTableContext();
  const testId = useTestId('body');
  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const measureElement = virtualizer.measureElement;
  const rows = table.getRowModel().rows;
  const colSpan = table.getVisibleLeafColumns().length;
  const scrollMargin = virtualizer.options.scrollMargin;

  return (
    <TableBodyRowDndContext>
      <TBody ref={tbodyRef} data-testid={testId}>
        {/* Above the top spacer — only on screen when scrolled to the very start. */}
        {isLoadingPrevious && (
          <TableLoadingState position='start' count={TABLE_PREPEND_SKELETON_ROWS} />
        )}
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
        {isLoading && <TableLoadingState />}
        {virtualRows.length > 0 && (
          <Tr key='spacer-bottom'>
            <Td
              style={{
                // `end` includes `scrollMargin`, `getTotalSize()` does not. Unbalanced,
                // the height goes negative near the end, the browser drops the invalid
                // value and keeps the previous one — a stale blank tail under the rows.
                height: `${totalSize + scrollMargin - (virtualRows[virtualRows.length - 1]?.end ?? 0)}px`,
                padding: 0,
                border: 'none',
              }}
              colSpan={colSpan}
            />
          </Tr>
        )}
      </TBody>
    </TableBodyRowDndContext>
  );
};

TableBodyVirtualizedCore.displayName = 'TableBodyVirtualizedCore';
