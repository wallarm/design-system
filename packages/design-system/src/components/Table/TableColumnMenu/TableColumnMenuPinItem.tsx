import type { FC } from 'react';
import { Pin, PinOff } from '../../../icons';
import { DropdownMenuItem, type DropdownMenuItemProps } from '../../DropdownMenu';
import { useTableContext } from '../TableContext';
import { useTableColumnMenuContext } from './TableColumnMenu';

export type TableColumnMenuPinItemProps = DropdownMenuItemProps;

/**
 * Pin / unpin toggle. Renders "Pin" when the column is unpinned and "Unpin"
 * when it is — the same DOM node receives the consumer's `data-analytics-id`
 * in both states, so a single id captures both transitions. Auto-suppresses
 * when the column cannot be pinned (or is always-pinned).
 */
export const TableColumnMenuPinItem: FC<TableColumnMenuPinItemProps> = ({
  onSelect,
  children,
  ...rest
}) => {
  const { column } = useTableColumnMenuContext();
  const ctx = useTableContext();

  const isPinned = column.getIsPinned();
  const isAlwaysPinned = ctx.alwaysPinnedLeft.includes(column.id);
  const canPin = ctx.pinningEnabled && column.getCanPin() && !isAlwaysPinned;

  if (!canPin) return null;

  const handleSelect = () => {
    onSelect?.();
    column.pin(isPinned ? false : 'left');
  };

  return (
    <DropdownMenuItem {...rest} onSelect={handleSelect}>
      {isPinned ? <PinOff size='sm' /> : <Pin size='sm' />}
      {children ?? (isPinned ? 'Unpin' : 'Pin')}
    </DropdownMenuItem>
  );
};

TableColumnMenuPinItem.displayName = 'TableColumnMenuPinItem';
