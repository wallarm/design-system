import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import { tableLayoutHead } from '../classes';

export const TableLayoutHead = forwardRef<HTMLTableSectionElement, ComponentPropsWithRef<'thead'>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn(tableLayoutHead, className)} {...props} />
  ),
);
TableLayoutHead.displayName = 'TableLayoutHead';
