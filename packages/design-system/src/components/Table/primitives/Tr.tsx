import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import { tableRowVariants } from '../classes';

export const Tr = forwardRef<HTMLTableRowElement, ComponentPropsWithRef<'tr'>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn(tableRowVariants(), className)} {...props} />
  ),
);
Tr.displayName = 'Tr';
