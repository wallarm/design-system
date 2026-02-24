import { type Cell, flexRender } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { getPinningStyles, isLastPinnedLeft, TABLE_EXPAND_COLUMN_ID, useColumnDnd } from './lib';
import { Td } from './primitives';
import { useTableContext } from './TableContext';

interface TableBodyCellProps<T> {
  cell: Cell<T, unknown>;
  colSpan?: number;
  className?: string;
  disablePinnedShadow?: boolean;
}

export const TableBodyCell = <T,>({
  cell,
  colSpan,
  className,
  disablePinnedShadow,
}: TableBodyCellProps<T>) => {
  const { allLeafColumns } = useTableContext<T>();
  const column = cell.column;
  const isPinned = column.getIsPinned();
  const meta = column.columnDef.meta;
  const isExpandedToggle = column.id === TABLE_EXPAND_COLUMN_ID && cell.row.getIsExpanded();

  const { canDnd, setNodeRef, dndStyle } = useColumnDnd(column);

  const pinningStyles = getPinningStyles(column);
  const lastLeft = isLastPinnedLeft(column, allLeafColumns, column.id);

  return (
    <Td
      className={cn(meta?.cellClassName, className)}
      pinned={isPinned === 'left'}
      lastPinnedLeft={disablePinnedShadow ? false : lastLeft}
      expanded={isExpandedToggle}
      ref={canDnd ? setNodeRef : undefined}
      style={{ ...pinningStyles, width: cell.column.getSize(), ...dndStyle }}
      colSpan={colSpan}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </Td>
  );
};

TableBodyCell.displayName = 'TableBodyCell';
