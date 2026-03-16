import type { FC } from 'react';
import { ArrowRight } from '../../icons';
import { cn } from '../../utils/cn';

/**
 * Visual separator (arrow icon) between start and end date fields in a date range input.
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
    <span className={cn('text-icon-secondary select-none')} aria-hidden='true'>
      <ArrowRight size='md' />
    </span>
  );
};

DateRangeSeparator.displayName = 'DateRangeSeparator';
