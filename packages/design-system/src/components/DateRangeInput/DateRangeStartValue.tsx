import type { FC } from 'react';
import { useDateRangeContext } from './DateRangeContext';
import { DateRangeSegmentGroup } from './DateRangeSegmentGroup';

/**
 * Renders the start date/time input field for a date range.
 * Must be used within `DateRangeProvider` — `useDateRangeContext` will throw
 * if rendered outside.
 *
 * @example
 * <DateRangeProvider value={range} onChange={setRange}>
 *   <DateRangeStartValue />
 *   <DateRangeSeparator />
 *   <DateRangeEndValue />
 * </DateRangeProvider>
 */
export const DateRangeStartValue: FC = () => {
  const { startFieldProps, startRef } = useDateRangeContext();
  return <DateRangeSegmentGroup {...startFieldProps} ref={startRef} type='start' />;
};

DateRangeStartValue.displayName = 'DateRangeStartValue';
