import { forwardRef } from 'react';
import { DateInput, type DateInputProps } from '../DateInput';

export interface DateTimeInputProps extends Omit<DateInputProps, 'granularity'> {
  /**
   * Determines the smallest unit of time that can be edited.
   * - 'hour': Date with hours
   * - 'minute': Date with hours and minutes (default)
   * - 'second': Date with hours, minutes, and seconds
   */
  granularity?: 'hour' | 'minute' | 'second';
}

export const DateTimeInput = forwardRef<HTMLDivElement, DateTimeInputProps>(
  ({ granularity = 'minute', ...props }, ref) => {
    return <DateInput {...props} ref={ref} granularity={granularity} />;
  },
);

DateTimeInput.displayName = 'DateTimeInput';
