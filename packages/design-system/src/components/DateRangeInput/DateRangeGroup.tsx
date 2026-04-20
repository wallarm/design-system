import type { FC, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { useDateRangeContext } from './DateRangeContext';

const dateRangeGroupVariants = cva(
  cn(
    'relative group/temporal flex-1 h-full flex items-center gap-4',
    'focus-within:outline-none',
    'data-disabled:opacity-50 data-disabled:cursor-not-allowed',
  ),
);

interface DateRangeGroupProps {
  children: ReactNode;
  className?: string;
}

export const DateRangeGroup: FC<DateRangeGroupProps> = ({ children, className }) => {
  const context = useDateRangeContext();
  const { groupProps = {}, finalRef, disabled, error } = context ?? {};

  return (
    <div
      {...groupProps}
      ref={finalRef}
      data-slot='date-range-group'
      className={cn(dateRangeGroupVariants(), className)}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      aria-invalid={error || undefined}
    >
      {children}
    </div>
  );
};
