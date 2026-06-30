import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import {
  tableLayoutFirstPinnedRight,
  tableLayoutHeaderCell,
  tableLayoutLastPinnedLeft,
  tableLayoutPinned,
} from '../classes';
import { useTableLayoutContext } from '../TableLayoutContext';
import { TableLayoutResizeHandle } from './TableLayoutResizeHandle';

export interface TableLayoutHeaderCellProps extends ComponentPropsWithRef<'th'> {
  columnId?: string;
}

export const TableLayoutHeaderCell = forwardRef<HTMLTableCellElement, TableLayoutHeaderCellProps>(
  ({ className, columnId, style, children, ...props }, ref) => {
    const { getColumn, setColumnSize } = useTableLayoutContext();
    const resolved = columnId ? getColumn(columnId) : undefined;
    const showResize = !!columnId && !!resolved?.resizable && !!setColumnSize;
    return (
      <th
        ref={ref}
        scope='col'
        data-column-id={columnId}
        className={cn(
          'relative',
          tableLayoutHeaderCell,
          resolved?.pin && tableLayoutPinned,
          resolved?.lastPinnedLeft && tableLayoutLastPinnedLeft,
          resolved?.firstPinnedRight && tableLayoutFirstPinnedRight,
          className,
        )}
        style={{ ...resolved?.stickyStyle, ...style }}
        {...props}
      >
        {children}
        {showResize ? <TableLayoutResizeHandle columnId={columnId as string} /> : null}
      </th>
    );
  },
);
TableLayoutHeaderCell.displayName = 'TableLayoutHeaderCell';
