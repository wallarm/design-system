import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import {
  tableLayoutFirstPinnedRight,
  tableLayoutHeaderCell,
  tableLayoutLastPinnedLeft,
  tableLayoutPinned,
} from '../classes';
import { useTableLayoutContext } from '../TableLayoutContext';

export interface TableLayoutHeaderCellProps extends ComponentPropsWithRef<'th'> {
  columnId?: string;
}

export const TableLayoutHeaderCell = forwardRef<HTMLTableCellElement, TableLayoutHeaderCellProps>(
  ({ className, columnId, style, ...props }, ref) => {
    const { getColumn } = useTableLayoutContext();
    const resolved = columnId ? getColumn(columnId) : undefined;
    return (
      <th
        ref={ref}
        scope='col'
        data-column-id={columnId}
        className={cn(
          tableLayoutHeaderCell,
          resolved?.pin && tableLayoutPinned,
          resolved?.lastPinnedLeft && tableLayoutLastPinnedLeft,
          resolved?.firstPinnedRight && tableLayoutFirstPinnedRight,
          className,
        )}
        style={{ ...resolved?.stickyStyle, ...style }}
        {...props}
      />
    );
  },
);
TableLayoutHeaderCell.displayName = 'TableLayoutHeaderCell';
