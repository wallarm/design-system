import type { FC } from 'react';
import { cn } from '../../utils/cn';

/**
 * Visual separator between start and end date fields in a date range input.
 * Renders a Unicode right arrow as plain text.
 * Used within DateRangeProvider for custom compositions.
 *
 * @example
 * <DateRangeProvider value={range} onChange={setRange}>
 *   <DateRangeStartValue />
 *   <DateRangeSeparator />
 *   <DateRangeEndValue />
 * </DateRangeProvider>
 */
export const DateRangeSeparator: FC = () => {
  return (
    <span
      data-slot='date-range-separator'
      className={cn('text-sm text-text-secondary select-none')}
      aria-hidden='true'
    >
      →
    </span>
  );
};

DateRangeSeparator.displayName = 'DateRangeSeparator';
