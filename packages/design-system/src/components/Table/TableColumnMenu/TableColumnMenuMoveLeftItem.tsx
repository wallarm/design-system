import type { FC } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { ArrowLeft } from '../../../icons';
import { DropdownMenuItem, type DropdownMenuItemProps } from '../../DropdownMenu';
import { useTableContext } from '../TableContext';
import { useTableColumnMenuContext } from './TableColumnMenu';

export type TableColumnMenuMoveLeftItemProps = DropdownMenuItemProps;

/**
 * "Move left" entry in the column header menu. Auto-suppresses when the
 * column cannot be reordered, is pinned, or is already first.
 */
export const TableColumnMenuMoveLeftItem: FC<TableColumnMenuMoveLeftItemProps> = ({
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
  const canMoveLeft = canReorder && columnIdx > 0 && !isPinned;

  if (!canMoveLeft) return null;

  const handleSelect = () => {
    onSelect?.();
    const allColumns = ctx.table.getAllLeafColumns();
    const currentOrder = ctx.table.getState().columnOrder.length
      ? ctx.table.getState().columnOrder
      : allColumns.map(c => c.id);
    const fromIdx = currentOrder.indexOf(column.id);
    const toIdx = fromIdx - 1;
    if (toIdx < 0) return;
    ctx.setColumnOrder(arrayMove(currentOrder, fromIdx, toIdx));
  };

  return (
    <DropdownMenuItem {...rest} onSelect={handleSelect}>
      <ArrowLeft size='sm' />
      {children ?? 'Move left'}
    </DropdownMenuItem>
  );
};

TableColumnMenuMoveLeftItem.displayName = 'TableColumnMenuMoveLeftItem';
