import type { FC } from 'react';

import { flexRender, type Row, type RowData } from '@tanstack/react-table';

import { cn } from '../../../utils/cn';
import { type DSTableFeatures, getAlignClass, useRenderEveryTime, withTableState } from '../lib';
import { Td, Tr } from '../primitives';
import { useTableContext } from '../TableContext';

interface TableRowOverlayProps<T extends RowData> {
  row: Row<DSTableFeatures, T>;
}

const TableRowOverlayInner = <T extends RowData>({ row }: TableRowOverlayProps<T>) => {
  const { table, renderFullWidthRow } = useTableContext<T>();
  const fullWidthContent = useRenderEveryTime(() => renderFullWidthRow?.(row));

  // Cells read column widths and consumer renderers — rebuilt on every table state change.
  return withTableState(table.state, () => {
    const visibleColumns = table.getVisibleLeafColumns();

    return (
      <table
        className='w-full table-fixed border-collapse'
        style={{ tableLayout: 'fixed', cursor: 'grabbing' }}
      >
        <tbody>
          <Tr className='pointer-events-none bg-bg-primary opacity-90 shadow-lg'>
            {fullWidthContent !== undefined && (
              <Td pinned={false} colSpan={row.getVisibleCells().length}>
                {fullWidthContent}
              </Td>
            )}
            {(fullWidthContent === undefined ? row.getVisibleCells() : []).map(cell => {
              const column = visibleColumns.find(c => c.id === cell.column.id);
              const meta = cell.column.columnDef.meta;
              return (
                <Td
                  key={cell.id}
                  // pinned={false} triggers tableBodyCellVariants base styles (px-16 py-8, borders, etc.)
                  pinned={false}
                  className={cn(getAlignClass(meta), meta?.cellClassName)}
                  style={{ width: column?.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              );
            })}
          </Tr>
        </tbody>
      </table>
    );
  });
};

export const TableRowOverlay = TableRowOverlayInner as FC<TableRowOverlayProps<RowData>>;

TableRowOverlay.displayName = 'TableRowOverlay';
