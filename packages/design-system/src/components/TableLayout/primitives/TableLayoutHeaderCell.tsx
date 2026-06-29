import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import { tableLayoutHeaderCell } from '../classes';

export const TableLayoutHeaderCell = forwardRef<HTMLTableCellElement, ComponentPropsWithRef<'th'>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} scope='col' className={cn(tableLayoutHeaderCell, className)} {...props} />
  ),
);
TableLayoutHeaderCell.displayName = 'TableLayoutHeaderCell';
