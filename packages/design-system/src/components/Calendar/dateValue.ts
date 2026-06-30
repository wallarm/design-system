import { CalendarDateTime } from '@internationalized/date';
import type { DateValue as ReactAriaDateValue } from '@react-aria/datepicker';
import type { DateValue } from './types';

type DateParts = { year: number; month: number; day: number };

// @ark-ui/react and @react-aria each bundle @internationalized/date; the
// instances are structurally identical, so we cast across the boundary.
export const toDateValue = <T>(date: T): DateValue => date as unknown as DateValue;

export const toReactAriaDateValue = (date: DateValue | undefined): ReactAriaDateValue | null =>
  date ? (date as unknown as ReactAriaDateValue) : null;

export const toArkDateValue = (
  date: ReactAriaDateValue | null | undefined,
): DateValue | undefined => (date ? (date as unknown as DateValue) : undefined);

/** Build a `CalendarDateTime` from `date`'s day and `time`; any time on `date` is ignored. */
export const withTime = (date: DateParts, time: { hour: number; minute: number }): DateValue =>
  toDateValue(new CalendarDateTime(date.year, date.month, date.day, time.hour, time.minute));

/** True when both values fall on the same calendar day. */
export const sameDate = (
  a: DateParts | null | undefined,
  b: DateParts | null | undefined,
): boolean => !!a && !!b && a.year === b.year && a.month === b.month && a.day === b.day;
