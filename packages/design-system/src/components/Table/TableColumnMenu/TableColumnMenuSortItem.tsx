import type { FC } from 'react';
import { Check } from '../../../icons';
import { DropdownMenuItem, type DropdownMenuItemProps } from '../../DropdownMenu';
import { SORT_LABELS } from '../lib';
import { useTableContext } from '../TableContext';
import { useTableColumnMenuContext } from './TableColumnMenu';

export interface TableColumnMenuSortItemProps extends DropdownMenuItemProps {
  /** Direction this item commits when selected. */
  direction: 'asc' | 'desc';
}

/**
 * "Sort ascending / descending" entry. Renders the localized label that
 * matches the column's `sortType` (e.g. "A → Z" for text, "Highest on top"
 * for number/score/size) and shows a checkmark when the column is currently
 * sorted in this direction. Auto-suppresses when sorting is disabled.
 *
 * The legacy default menu nests these items under a submenu; consumer-supplied
 * children can place them flat or inside their own `<DropdownMenu>` submenu —
 * the item itself doesn't care.
 */
export const TableColumnMenuSortItem: FC<TableColumnMenuSortItemProps> = ({
  direction,
  onSelect,
  children,
  ...rest
}) => {
  const { column } = useTableColumnMenuContext();
  const ctx = useTableContext();

  if (!ctx.sortingEnabled || !column.getCanSort()) return null;

  const sortDirection = column.getIsSorted();
  const sortType = column.columnDef.meta?.sortType;
  const [ascLabel, descLabel] = (sortType && SORT_LABELS[sortType]) || SORT_LABELS.text!;
  const label = direction === 'asc' ? ascLabel : descLabel;
  const isActive = sortDirection === direction;

  const handleSelect = () => {
    onSelect?.();
    column.toggleSorting(direction === 'desc');
  };

  return (
    <DropdownMenuItem {...rest} onSelect={handleSelect}>
      {children ?? label}
      {isActive && <Check size='sm' className='ml-auto text-icon-primary' />}
    </DropdownMenuItem>
  );
};

TableColumnMenuSortItem.displayName = 'TableColumnMenuSortItem';
