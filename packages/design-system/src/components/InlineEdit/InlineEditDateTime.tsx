import type { FC, ReactNode } from 'react';
import { Calendar as CalendarRoot, type DateValue } from '../Calendar';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

export interface InlineEditDateTimeProps {
  /**
   * `InlineEditDateTime` IS the prewired `Calendar` root (date+time:
   * `showTime`, `closeOnSelect={false}`) — the `DateValue[]` adapter and
   * commit-on-close live here. `children` are ordinary `Calendar` compound
   * parts (`CalendarTrigger > DateInput`, `CalendarContent > CalendarBody >
   * CalendarInputHeader > CalendarGrids`) — exactly as you'd compose a
   * standalone `Calendar`. Use `InlineEditDate` for day-only. Wire your own
   * `DateInput`'s `value`/`onChange` via `useInlineEdit()` plus the
   * `toReactAriaDateValue`/`toCalendarDateValue`/`withMinuteGranularity`
   * helpers from `./dateValueCast` (minute-granularity `DateInput` needs a
   * promoted day-only value, and the two `@internationalized/date` package
   * copies aren't `instanceof`-compatible). `Calendar` does not re-provide
   * its own testid cascade, so a `DateInput` you place inside already
   * resolves `useTestId(...)` from the ambient `InlineEdit` root — no extra
   * wiring needed.
   */
  children: ReactNode;
}

export const InlineEditDateTime: FC<InlineEditDateTimeProps> = ({ children }) => {
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
      {children}
    </CalendarRoot>
  );
};

InlineEditDateTime.displayName = 'InlineEditDateTime';
