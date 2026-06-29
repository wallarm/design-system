import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import { tableLayoutRow } from '../classes';

export interface TableLayoutRowProps extends ComponentPropsWithRef<'tr'> {
  /** Stable row id; stamps `data-row-id` so `TableLayoutHandle.scrollToRow` can find it. */
  rowId?: string;
}

export const TableLayoutRow = forwardRef<HTMLTableRowElement, TableLayoutRowProps>(
  ({ className, rowId, ...props }, ref) => (
    <tr ref={ref} data-row-id={rowId} className={cn(tableLayoutRow, className)} {...props} />
  ),
);
TableLayoutRow.displayName = 'TableLayoutRow';
