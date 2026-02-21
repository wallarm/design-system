import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';

export const THead = forwardRef<HTMLTableSectionElement, ComponentPropsWithRef<'thead'>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn(className)} {...props} />,
);
THead.displayName = 'THead';
