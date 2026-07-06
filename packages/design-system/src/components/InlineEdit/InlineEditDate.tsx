import type { FC, ReactNode } from 'react';
import { Calendar as CalendarRoot, type DateValue } from '../Calendar';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

export interface InlineEditDateProps {
  /**
   * `InlineEditDate` IS the prewired `Calendar` root (day-only:
   * `closeOnSelect`) — the `DateValue[]` adapter and commit-on-close live
   * here. `children` are ordinary `Calendar` compound parts
   * (`CalendarTrigger > DateInput`, `CalendarContent > CalendarBody >
   * CalendarGrids`) — exactly as you'd compose a standalone `Calendar`. Use
   * `InlineEditDateTime` for date+time. Wire your own `DateInput`'s
   * `value`/`onChange` via `useInlineEdit()` plus the `toReactAriaDateValue`/
   * `toCalendarDateValue` casts from `./dateValueCast` (the two
   * `@internationalized/date` package copies aren't `instanceof`-compatible).
   * `Calendar` does not re-provide its own testid cascade, so a `DateInput`
   * you place inside already resolves `useTestId(...)` from the ambient
   * `InlineEdit` root — no extra wiring needed.
   */
  children: ReactNode;
}

export const InlineEditDate: FC<InlineEditDateProps> = ({ children }) => {
  const { value, setValue, submit } = useInlineEdit<DateValue | null>();
  useInlineEditSubmitMode('none');

  return (
    <CalendarRoot
      type='single'
      defaultOpen
      closeOnSelect
      value={value ? [value] : []}
      onChange={next => setValue(next[0] ?? null)}
      onOpenChange={open => {
        if (!open) submit();
      }}
    >
      {children}
    </CalendarRoot>
  );
};

InlineEditDate.displayName = 'InlineEditDate';
