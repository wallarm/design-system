import { CalendarDateTime } from '@internationalized/date';
import type { DateValue as ReactAriaDateValue } from '@react-aria/datepicker';
import type { DateValue } from '../Calendar';

/**
 * Calendar's `DateValue` (Ark) and DateInput's `DateValue` (react-aria) are
 * structurally identical `@internationalized/date` classes from different
 * package copies — the story-documented interop hazard (Ark values fail an
 * `instanceof` check against react-aria's copy, and vice versa). Cast across
 * the boundary rather than validate, mirroring `toDateValue`/
 * `toReactAriaDateValue` in Calendar/dateValue.ts. Use these when composing a
 * `DateInput` trigger inside `InlineEditDate`/`InlineEditDateTime`.
 */
export const toReactAriaDateValue = (date: DateValue | null): ReactAriaDateValue | null =>
  date as unknown as ReactAriaDateValue | null;

export const toCalendarDateValue = (date: ReactAriaDateValue | null): DateValue | null =>
  date as unknown as DateValue | null;

/**
 * `DateInput` at `granularity='minute'` requires an hour/minute component —
 * react-aria's `useDateFieldState` throws "Invalid granularity" otherwise. A
 * committed value can be day-only (e.g. a consumer's initial `CalendarDate`,
 * before any time has been picked), so promote it to midnight, mirroring
 * Calendar's own date-only → `CalendarDateTime` promotion in `useCalendarTime`
 * / `withTime` (Calendar/dateValue.ts). The cast crosses the same
 * `@internationalized/date` package-instance boundary as the casts above.
 * Use this when composing a minute-granularity `DateInput` trigger inside
 * `InlineEditDateTime`.
 */
export const withMinuteGranularity = (date: DateValue | null): DateValue | null => {
  if (!date) return null;
  if ('hour' in date) return date;
  return new CalendarDateTime(date.year, date.month, date.day, 0, 0) as unknown as DateValue;
};
