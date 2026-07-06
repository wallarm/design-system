import type { FC, ReactNode } from 'react';
import { CalendarDateTime } from '@internationalized/date';
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
import { toCalendarDateValue, toReactAriaDateValue } from './dateValueCast';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

/**
 * Rest props forward to the real `DateInput` wrapper (see
 * `ANALYTICS_GAPS.md` — `InlineEditDate` entry — for why the wrapper, not the
 * focusable segments, is the documented landing target).
 *
 * `value` / `onChange` are internally controlled via `useInlineEdit`.
 * `granularity` / `showTimeDropdown` / `timeStep` are omitted — this
 * component is always minute-granularity with the time-aware header; use
 * `InlineEditDate` for day-only.
 */
export interface InlineEditDateTimeProps
  extends Omit<
    DateInputProps,
    'value' | 'onChange' | 'granularity' | 'showTimeDropdown' | 'timeStep'
  > {
  /**
   * Bound-root pattern: `InlineEditDateTime` IS the prewired `Calendar`
   * root — the `DateValue[]` adapter, `defaultOpen`, `showTime`, and
   * commit-on-close all stay on the root regardless of composition.
   * `children` are ordinary `Calendar` compound parts (`CalendarTrigger`,
   * `CalendarContent > CalendarBody > …`) rendered inside that root, not a
   * replacement wrapper. Composing children means the consumer owns their
   * own testids/attributes on their own parts — the shared `input` testId
   * slot below only lands on the default `DateInput` trigger.
   *
   * No children → the default composition renders (minute-granularity
   * segmented `DateInput` trigger + `CalendarInputHeader` + grids).
   */
  children?: ReactNode;
}

/**
 * `DateInput` at `granularity='minute'` requires an hour/minute component —
 * react-aria's `useDateFieldState` throws "Invalid granularity" otherwise. A
 * committed value can be day-only (e.g. a consumer's initial `CalendarDate`,
 * before any time has been picked), so promote it to midnight, mirroring
 * Calendar's own date-only → `CalendarDateTime` promotion in `useCalendarTime`
 * / `withTime` (Calendar/dateValue.ts). The cast crosses the same
 * `@internationalized/date` package-instance boundary as `dateValueCast.ts`.
 */
const withMinuteGranularity = (date: DateValue | null): DateValue | null => {
  if (!date) return null;
  if ('hour' in date) return date;
  return new CalendarDateTime(date.year, date.month, date.day, 0, 0) as unknown as DateValue;
};

export const InlineEditDateTime: FC<InlineEditDateTimeProps> = ({
  'data-testid': testIdProp,
  showIcon = false,
  children,
  ...rest
}) => {
  const testId = useTestId('input', testIdProp);
  const { value, setValue, submit } = useInlineEdit<DateValue | null>();
  useInlineEditSubmitMode('none');

  return (
    <CalendarRoot
      type='single'
      defaultOpen
      showTime
      closeOnSelect={false}
      value={value ? [value] : []}
      // Calendar's contract is DateValue[]; `useCalendarTime` has already
      // promoted a grid pick to a CalendarDateTime by the time this fires.
      onChange={next => setValue(next[0] ?? null)}
      onOpenChange={open => {
        if (!open) submit();
      }}
    >
      {children ?? (
        <>
          <CalendarTrigger>
            {/* Pass the value straight through — an `instanceof` gate drops values
                produced by the Ark calendar (different @internationalized/date
                copy), showing the placeholder instead. */}
            <DateInput
              {...rest}
              data-testid={testId}
              value={toReactAriaDateValue(withMinuteGranularity(value ?? null))}
              onChange={v => setValue(toCalendarDateValue(v))}
              granularity='minute'
              showIcon={showIcon}
            />
          </CalendarTrigger>
          <CalendarContent>
            <CalendarBody>
              <CalendarInputHeader />
              <CalendarGrids />
            </CalendarBody>
          </CalendarContent>
        </>
      )}
    </CalendarRoot>
  );
};

InlineEditDateTime.displayName = 'InlineEditDateTime';
