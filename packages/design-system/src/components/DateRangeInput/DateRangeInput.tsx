import { forwardRef } from 'react';
import { Calendar } from '../../icons';
import { DateRangeProvider } from './DateRangeContext';
import { DateRangeInputInternal } from './DateRangeInputInternal';
import type { DateRangeInputProps } from './types';

/**
 * Date range input component with start and end date fields.
 * Supports date and time selection with configurable granularity.
 * Built on React Aria's date range picker for accessibility.
 *
 * @example
 * // Basic date range input
 * <DateRangeInput
 *   value={dateRange}
 *   onChange={setDateRange}
 * />
 *
 * @example
 * // Date range with time (minutes)
 * <DateRangeInput
 *   granularity="minute"
 *   value={dateTimeRange}
 *   onChange={setDateTimeRange}
 * />
 *
 * @example
 * // Custom composition with compound components
 * <DateRangeProvider value={range} onChange={setRange}>
 *   <DateRangeStartValue />
 *   <DateRangeSeparator />
 *   <DateRangeEndValue />
 * </DateRangeProvider>
 */
export const DateRangeInput = forwardRef<HTMLDivElement, DateRangeInputProps>(
  ({ hasIcon = true, ...props }, ref) => {
    const icon = hasIcon ? Calendar : undefined;
    return (
      <DateRangeProvider {...props} hasIcon={hasIcon} ref={ref}>
        <DateRangeInputInternal icon={icon} />
      </DateRangeProvider>
    );
  },
);

DateRangeInput.displayName = 'DateRangeInput';
