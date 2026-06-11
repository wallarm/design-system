import type { FC, HTMLAttributes } from 'react';
import type { TestableProps } from '../../utils/testId';
import { useDateRangeContext } from './DateRangeContext';
import { DateRangeSegmentGroup } from './DateRangeSegmentGroup';

export interface DateRangeEndValueProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'>,
    TestableProps {}

/**
 * Renders the end date/time input field for a date range.
 * Must be used within `DateRangeProvider` — `useDateRangeContext` will throw
 * if rendered outside.
 *
 * Arbitrary HTML attributes (`data-analytics-id`, `data-analytics-props`,
 * `data-testid`, `aria-*`, `id`, event handlers) land on the field's
 * wrapper `<div>`, giving consumers a per-field analytics seam.
 */
export const DateRangeEndValue: FC<DateRangeEndValueProps> = props => {
  const { endFieldProps, endRef } = useDateRangeContext();
  return (
    <DateRangeSegmentGroup {...endFieldProps} ref={endRef} type='end' wrapperHtmlProps={props} />
  );
};

DateRangeEndValue.displayName = 'DateRangeEndValue';
