import type { FC } from 'react';
import { useDateRangeContext } from './DateRangeContext';
import { DateRangeSegmentGroup } from './DateRangeSegmentGroup';

/**
 * Renders the start date/time input field for a date range.
 * Must be used within DateRangeProvider context.
 *
 * Displays editable segments for the start date and optionally time,
 * depending on the granularity set in DateRangeProvider.
 *
 * @example
 * <DateRangeProvider value={range} onChange={setRange}>
 *   <DateRangeStartValue />
 *   <DateRangeSeparator />
 *   <DateRangeEndValue />
 * </DateRangeProvider>
 */
export const DateRangeStartValue: FC = () => {
  const context = useDateRangeContext();

  if (!context) {
    return null;
  }

  const { startFieldProps, startRef } = context;

  return <DateRangeSegmentGroup {...startFieldProps} ref={startRef} type='start' />;
};
