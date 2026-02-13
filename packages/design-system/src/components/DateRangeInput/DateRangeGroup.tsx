import type { FC, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { useDateRangeContext } from './DateRangeContext';

const dateRangeGroupVariants = cva(
  cn(
    'group/temporal flex-1 h-full flex items-center gap-4',
    'focus-within:outline-none',
    'data-disabled:opacity-50 data-disabled:cursor-not-allowed',
  ),
);

interface DateRangeGroupProps {
  children: ReactNode;
}

export const DateRangeGroup: FC<DateRangeGroupProps> = ({ children }) => {
  const context = useDateRangeContext();
  const { groupProps = {}, finalRef, disabled, error } = context ?? {};

  return (
    <div
      {...groupProps}
      ref={finalRef}
      data-slot='date-range-group'
      className={cn(dateRangeGroupVariants())}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      aria-invalid={error || undefined}
    >
      {children}
    </div>
  );
};
