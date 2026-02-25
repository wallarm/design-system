import type { Row } from '@tanstack/react-table';
import { TABLE_EXPAND_COLUMN_ID } from './lib';
import { Td, Tr } from './primitives';
import { useTableContext } from './TableContext';

interface TableRowExpandedProps<T> {
  row: Row<T>;
}

export const TableRowExpanded = <T,>({ row }: TableRowExpandedProps<T>) => {
  const { table, renderExpandedRow } = useTableContext<T>();

  if (!row.getIsExpanded() || !renderExpandedRow) return null;

  const visibleColumns = table.getVisibleLeafColumns();
  const hasExpandColumn = visibleColumns.some(col => col.id === TABLE_EXPAND_COLUMN_ID);

  // Expand column stays empty, content spans the remaining columns
  const contentColSpan = hasExpandColumn ? visibleColumns.length - 1 : visibleColumns.length;

  return (
    <Tr>
      {hasExpandColumn && (
        <Td className='border-b border-border-primary-light bg-bg-surface-2 sticky left-0' />
      )}
      <Td
        colSpan={contentColSpan}
        className='border-b border-border-primary-light bg-bg-primary p-0'
      >
        <div className='px-16 py-12'>{renderExpandedRow(row)}</div>
      </Td>
    </Tr>
  );
};

TableRowExpanded.displayName = 'Expanded';
