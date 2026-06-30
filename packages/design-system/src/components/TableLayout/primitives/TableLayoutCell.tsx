import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import {
  cellAlignClass,
  tableLayoutCell,
  tableLayoutFirstPinnedRight,
  tableLayoutLastPinnedLeft,
  tableLayoutPinned,
} from '../classes';
import { useTableLayoutContext } from '../TableLayoutContext';

export interface TableLayoutCellProps extends ComponentPropsWithRef<'td'> {
  /** Binds this cell to a TableLayoutColumn of the same columnId to inherit presentation (align, pin, width, visibility). */
  columnId?: string;
}

export const TableLayoutCell = forwardRef<HTMLTableCellElement, TableLayoutCellProps>(
  ({ className, columnId, style, ...props }, ref) => {
    const { getColumn } = useTableLayoutContext();
    const resolved = columnId ? getColumn(columnId) : undefined;
    if (resolved?.hidden) return null;
    return (
      <td
        ref={ref}
        data-column-id={columnId}
        className={cn(
          tableLayoutCell,
          resolved?.align && cellAlignClass[resolved.align],
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
TableLayoutCell.displayName = 'TableLayoutCell';
