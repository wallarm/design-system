import type { FC } from 'react';
import { CalendarDateTime } from '@internationalized/date';
import type { DateValue as ReactAriaDateValue } from '@react-aria/datepicker';
import { useTestId } from '../../utils/testId';
import {
  CalendarBody,
  CalendarContent,
  CalendarGrids,
  CalendarInputHeader,
  // Aliased: the DS also exports a `Calendar` icon; same trick as the stories.
  Calendar as CalendarRoot,
  CalendarTrigger,
  type DateValue,
} from '../Calendar';
import { DateInput, type DateInputProps } from '../DateInput';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

/**
 * Rest props forward to the real `DateInput` wrapper (see
 * `ANALYTICS_GAPS.md` — `InlineEditDate` entry — for why the wrapper, not the
 * focusable segments, is the documented landing target).
 *
 * `value` / `onChange` are internally controlled via `useInlineEdit`.
 * `granularity` / `showTimeDropdown` / `timeStep` are omitted because
 * `DateInput`'s granularity is a discriminated union the two branches below
 * (day vs. minute) already resolve from `showTime` — exposing them here
 * would let a consumer prop fight the branch's own choice.
 */
export interface InlineEditDateProps
  extends Omit<
    DateInputProps,
    'value' | 'onChange' | 'granularity' | 'showTimeDropdown' | 'timeStep'
  > {
  /**
   * Date+time mode: minute-granularity segmented trigger, time-aware popover
   * header, popover stays open on day picks (mirrors Calendar `showTime`).
   */
  showTime?: boolean;
}

/**
 * Calendar's `DateValue` (Ark) and DateInput's `DateValue` (react-aria) are
 * structurally identical `@internationalized/date` classes from different
 * package copies — the story-documented interop hazard (Ark values fail an
 * `instanceof` check against react-aria's copy, and vice versa). Cast across
 * the boundary rather than validate, mirroring `toDateValue`/
 * `toReactAriaDateValue` in Calendar/dateValue.ts.
 */
const toReactAriaDateValue = (date: DateValue | null): ReactAriaDateValue | null =>
  date as unknown as ReactAriaDateValue | null;

const toCalendarDateValue = (date: ReactAriaDateValue | null): DateValue | null =>
  date as unknown as DateValue | null;

/**
 * `DateInput` at `granularity='minute'` requires an hour/minute component —
 * react-aria's `useDateFieldState` throws "Invalid granularity" otherwise. A
 * committed value can be day-only (e.g. a consumer's initial `CalendarDate`,
 * before any time has been picked), so promote it to midnight, mirroring
 * Calendar's own date-only → `CalendarDateTime` promotion in `useCalendarTime`
 * / `withTime` (Calendar/dateValue.ts). The cast crosses the same
 * `@internationalized/date` package-instance boundary noted above.
 */
const withMinuteGranularity = (date: DateValue | null): DateValue | null => {
  if (!date) return null;
  if ('hour' in date) return date;
  return new CalendarDateTime(date.year, date.month, date.day, 0, 0) as unknown as DateValue;
};

export const InlineEditDate: FC<InlineEditDateProps> = ({
  showTime = false,
  'data-testid': testIdProp,
  showIcon = false,
  ...rest
}) => {
  const testId = useTestId('input', testIdProp);
  const { value, setValue, submit } = useInlineEdit<DateValue | null>();
  useInlineEditSubmitMode('none');

  return (
    <CalendarRoot
      type='single'
      defaultOpen
      showTime={showTime}
      closeOnSelect={!showTime}
      value={value ? [value] : []}
      // Calendar's contract is DateValue[]; in showTime mode `useCalendarTime`
      // has already promoted a grid pick to a CalendarDateTime by the time
      // this fires, so `next[0]` is Calendar's DateValue either way.
      onChange={next => setValue(next[0] ?? null)}
      onOpenChange={open => {
        if (!open) submit();
      }}
    >
      <CalendarTrigger>
        {/* Pass the value straight through — an `instanceof` gate drops values
            produced by the Ark calendar (different @internationalized/date
            copy), showing the placeholder instead. */}
        {showTime ? (
          <DateInput
            {...rest}
            data-testid={testId}
            value={toReactAriaDateValue(withMinuteGranularity(value ?? null))}
            onChange={v => setValue(toCalendarDateValue(v))}
            granularity='minute'
            showIcon={showIcon}
          />
        ) : (
          <DateInput
            {...rest}
            data-testid={testId}
            value={toReactAriaDateValue(value ?? null)}
            onChange={v => setValue(toCalendarDateValue(v))}
            granularity='day'
            showIcon={showIcon}
          />
        )}
      </CalendarTrigger>
      <CalendarContent>
        <CalendarBody>
          {showTime ? <CalendarInputHeader /> : null}
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
    </CalendarRoot>
  );
};

InlineEditDate.displayName = 'InlineEditDate';
