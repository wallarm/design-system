import type { FC } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { ArrowRight } from '../../../icons';
import { DropdownMenuItem, type DropdownMenuItemProps } from '../../DropdownMenu';
import { useTableContext } from '../TableContext';
import { useTableColumnMenuContext } from './TableColumnMenu';

export type TableColumnMenuMoveRightItemProps = DropdownMenuItemProps;

/**
 * "Move right" entry in the column header menu. Auto-suppresses when the
 * column cannot be reordered, is pinned, or is already last.
 */
export const TableColumnMenuMoveRightItem: FC<TableColumnMenuMoveRightItemProps> = ({
  onSelect,
  children,
  ...rest
}) => {
  const { column } = useTableColumnMenuContext();
  const ctx = useTableContext();

  const isPinned = column.getIsPinned();
  const isAlwaysPinned = ctx.alwaysPinnedLeft.includes(column.id);
  const canReorder = ctx.columnDndEnabled && !isAlwaysPinned;
  const visibleColumns = ctx.table.getVisibleLeafColumns();
  const columnIdx = visibleColumns.findIndex(c => c.id === column.id);
  const isLast = columnIdx === visibleColumns.length - 1;
  const canMoveRight = canReorder && !isLast && !isPinned;

  if (!canMoveRight) return null;

  const handleSelect = () => {
    onSelect?.();
    const allColumns = ctx.table.getAllLeafColumns();
    const currentOrder = ctx.table.getState().columnOrder.length
      ? ctx.table.getState().columnOrder
      : allColumns.map(c => c.id);
    const fromIdx = currentOrder.indexOf(column.id);
    const toIdx = fromIdx + 1;
    if (toIdx >= currentOrder.length) return;
    ctx.setColumnOrder(arrayMove(currentOrder, fromIdx, toIdx));
  };

  return (
    <DropdownMenuItem {...rest} onSelect={handleSelect}>
      <ArrowRight size='sm' />
      {children ?? 'Move right'}
    </DropdownMenuItem>
  );
};

TableColumnMenuMoveRightItem.displayName = 'TableColumnMenuMoveRightItem';
