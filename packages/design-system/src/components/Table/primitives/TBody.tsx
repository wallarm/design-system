import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';

export const TBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithRef<'tbody'>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn(className)} {...props} />,
);
TBody.displayName = 'TBody';
