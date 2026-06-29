import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import { cellAlignClass, tableLayoutCell } from '../classes';
import { useTableLayoutContext } from '../TableLayoutContext';

export interface TableLayoutCellProps extends ComponentPropsWithRef<'td'> {
  /** Binds this cell to a `TableLayoutColumn` of the same `columnId` to inherit presentation. */
  columnId?: string;
}

export const TableLayoutCell = forwardRef<HTMLTableCellElement, TableLayoutCellProps>(
  ({ className, columnId, ...props }, ref) => {
    const { getColumn } = useTableLayoutContext();
    const align = columnId ? getColumn(columnId)?.align : undefined;
    return (
      <td
        ref={ref}
        data-column-id={columnId}
        className={cn(tableLayoutCell, align && cellAlignClass[align], className)}
        {...props}
      />
    );
  },
);
TableLayoutCell.displayName = 'TableLayoutCell';
