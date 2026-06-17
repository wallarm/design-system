import type { FC } from 'react';
import { EyeOff } from '../../../icons';
import { DropdownMenuItem, type DropdownMenuItemProps } from '../../DropdownMenu';
import { useTableContext } from '../TableContext';
import { useTableColumnMenuContext } from './TableColumnMenu';

export type TableColumnMenuHideItemProps = DropdownMenuItemProps;

/**
 * "Hide" entry in the column header menu. Auto-suppresses when the column
 * cannot be hidden.
 */
export const TableColumnMenuHideItem: FC<TableColumnMenuHideItemProps> = ({
  onSelect,
  children,
  ...rest
}) => {
  const { column } = useTableColumnMenuContext();
  const ctx = useTableContext();

  const canHide = ctx.visibilityEnabled && column.getCanHide();
  if (!canHide) return null;

  const handleSelect = () => {
    onSelect?.();
    column.toggleVisibility(false);
  };

  return (
    <DropdownMenuItem {...rest} onSelect={handleSelect}>
      <EyeOff size='sm' />
      {children ?? 'Hide'}
    </DropdownMenuItem>
  );
};

TableColumnMenuHideItem.displayName = 'TableColumnMenuHideItem';
