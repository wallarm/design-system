import type { DateValue as ReactAriaDateValue } from '@react-aria/datepicker';
import type { DateValue } from '../Calendar';

/**
 * Calendar's `DateValue` (Ark) and DateInput's `DateValue` (react-aria) are
 * structurally identical `@internationalized/date` classes from different
 * package copies — the story-documented interop hazard (Ark values fail an
 * `instanceof` check against react-aria's copy, and vice versa). Cast across
 * the boundary rather than validate, mirroring `toDateValue`/
 * `toReactAriaDateValue` in Calendar/dateValue.ts. Shared by `InlineEditDate`
 * and `InlineEditDateTime`.
 */
export const toReactAriaDateValue = (date: DateValue | null): ReactAriaDateValue | null =>
  date as unknown as ReactAriaDateValue | null;

export const toCalendarDateValue = (date: ReactAriaDateValue | null): DateValue | null =>
  date as unknown as DateValue | null;
