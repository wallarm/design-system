import type { FC } from 'react';
import { useDateRangeContext } from './DateRangeContext';
import { DateRangeSegmentGroup } from './DateRangeSegmentGroup';

/**
 * Renders the end date/time input field for a date range.
 * Must be used within `DateRangeProvider` — `useDateRangeContext` will throw
 * if rendered outside.
 */
export const DateRangeEndValue: FC = () => {
  const { endFieldProps, endRef } = useDateRangeContext();
  return <DateRangeSegmentGroup {...endFieldProps} ref={endRef} type='end' />;
};

DateRangeEndValue.displayName = 'DateRangeEndValue';
