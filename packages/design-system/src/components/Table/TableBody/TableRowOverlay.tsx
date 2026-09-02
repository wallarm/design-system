import type { FC } from 'react';
import { flexRender, type Row, type RowData } from '@tanstack/react-table';
import { cn } from '../../../utils/cn';
import { type DSTableFeatures, getAlignClass } from '../lib';
import { Td, Tr } from '../primitives';
import { useTableContext } from '../TableContext';

interface TableRowOverlayProps<T extends RowData> {
  row: Row<DSTableFeatures, T>;
}

const TableRowOverlayInner = <T extends RowData>({ row }: TableRowOverlayProps<T>) => {
  const { table } = useTableContext<T>();
  const visibleColumns = table.getVisibleLeafColumns();

  return (
    <table className='w-full table-fixed border-collapse' style={{ tableLayout: 'fixed' }}>
      <tbody>
        <Tr className='pointer-events-none shadow-lg opacity-90 bg-bg-primary'>
          {row.getVisibleCells().map(cell => {
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
};

export const TableRowOverlay = TableRowOverlayInner as FC<TableRowOverlayProps<RowData>>;

TableRowOverlay.displayName = 'TableRowOverlay';
