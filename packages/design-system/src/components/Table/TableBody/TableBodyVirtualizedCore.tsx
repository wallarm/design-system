import type { FC, RefObject } from 'react';
import type { VirtualItem } from '@tanstack/react-virtual';
import { useTestId } from '../../../utils/testId';
import { TABLE_PREPEND_SKELETON_ROWS, useTableValue } from '../lib';
import { TBody, Td, Tr } from '../primitives';
import { useTableContext } from '../TableContext';
import { TableLoadingState } from '../TableLoadingState';
import { TableRow } from '../TableRow';
import { TableBodyRowDndContext } from './TableBodyRowDndContext';

/**
 * The virtualizer is a mutable @tanstack/react-virtual instance (a React
 * Compiler-incompatible library — its callers are left uncompiled), so the
 * hosts read it on every render and pass plain values down: this component
 * stays compilable and memoizes against inputs that actually change.
 */
export interface TableBodyVirtualizedCoreProps {
  tbodyRef: RefObject<HTMLTableSectionElement | null>;
  /** `virtualizer.getVirtualItems()` — a new array whenever the visible range or measurements change. */
  virtualRows: VirtualItem[];
  /** `virtualizer.getTotalSize()` */
  totalSize: number;
  /** `virtualizer.options.scrollMargin` */
  scrollMargin: number;
  /** `virtualizer.measureElement` (stable for the instance's lifetime) */
  measureElement: (node: Element | null) => void;
}

export const TableBodyVirtualizedCore: FC<TableBodyVirtualizedCoreProps> = ({
  tbodyRef,
  virtualRows,
  totalSize,
  scrollMargin,
  measureElement,
}) => {
  const { table, isLoading, isLoadingPrevious } = useTableContext();
  const testId = useTestId('body');
  const rows = useTableValue(() => table.getRowModel().rows);
  const colSpan = useTableValue(() => table.getVisibleLeafColumns().length);

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
