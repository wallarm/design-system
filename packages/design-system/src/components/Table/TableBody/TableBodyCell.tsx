import { type Cell, flexRender } from '@tanstack/react-table';
import { cn } from '../../../utils/cn';
import {
  getAlignClass,
  getPinningStyles,
  isLastPinnedLeft,
  TABLE_EXPAND_COLUMN_ID,
  useColumnDnd,
} from '../lib';
import { Td } from '../primitives';
import { useTableContext } from '../TableContext';

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
  const isExpandColumn = column.id === TABLE_EXPAND_COLUMN_ID;
  const isExpandedToggle = isExpandColumn && (cell.row.getIsExpanded() || cell.row.depth > 0);

  const { canDnd, setNodeRef, dndStyle } = useColumnDnd(column);

  const pinningStyles = getPinningStyles(column);
  const lastLeft = isLastPinnedLeft(column, allLeafColumns, column.id);

  const isCut = meta?.resizeType === 'cut';
  const content = flexRender(cell.column.columnDef.cell, cell.getContext());

  return (
    <Td
      className={cn(
        getAlignClass(meta),
        meta?.cellClassName,
        isExpandColumn &&
          cell.row.depth > 0 && [
            '[tr[data-depth]:has(+_tr:not([data-depth]))_&]:!border-b',
            '[tr[data-depth]:last-child_&]:!border-b',
          ],
        className,
      )}
      pinned={isPinned === 'left'}
      lastPinnedLeft={disablePinnedShadow ? false : lastLeft}
      expanded={isExpandedToggle}
      ref={canDnd ? setNodeRef : undefined}
      style={{
        ...pinningStyles,
        width: cell.column.getSize(),
        ...dndStyle,
        overflow: isCut ? 'hidden' : 'visible',
      }}
      colSpan={colSpan}
    >
      {isCut ? (
        <div className='overflow-hidden' style={{ minWidth: column.columnDef.size }}>
          {content}
        </div>
      ) : (
        <div className='flex flex-wrap [&_*]:flex-wrap [&_*]:min-w-0 [&_*]:truncate'>
          {content}
        </div>
      )}
    </Td>
  );
};

TableBodyCell.displayName = 'TableBodyCell';
