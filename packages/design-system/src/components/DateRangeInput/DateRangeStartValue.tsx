import type { FC, HTMLAttributes } from 'react';
import type { TestableProps } from '../../utils/testId';
import { useDateRangeContext } from './DateRangeContext';
import { DateRangeSegmentGroup } from './DateRangeSegmentGroup';

export interface DateRangeStartValueProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'>,
    TestableProps {}

/**
 * Renders the start date/time input field for a date range.
 * Must be used within `DateRangeProvider` — `useDateRangeContext` will throw
 * if rendered outside.
 *
 * Arbitrary HTML attributes (`data-analytics-id`, `data-analytics-props`,
 * `data-testid`, `aria-*`, `id`, event handlers) land on the field's
 * wrapper `<div>`, giving consumers a per-field analytics seam.
 *
 * @example
 * <DateRangeProvider value={range} onChange={setRange}>
 *   <DateRangeStartValue data-analytics-id='RANGE_START' />
 *   <DateRangeSeparator />
 *   <DateRangeEndValue data-analytics-id='RANGE_END' />
 * </DateRangeProvider>
 */
export const DateRangeStartValue: FC<DateRangeStartValueProps> = props => {
  const { startFieldProps, startRef } = useDateRangeContext();
  return (
    <DateRangeSegmentGroup
      {...startFieldProps}
      ref={startRef}
      type='start'
      wrapperHtmlProps={props}
    />
  );
};

DateRangeStartValue.displayName = 'DateRangeStartValue';
