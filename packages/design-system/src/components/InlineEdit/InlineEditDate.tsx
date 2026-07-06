import type { FC, ReactNode } from 'react';
import { useTestId } from '../../utils/testId';
import {
  CalendarBody,
  CalendarContent,
  CalendarGrids,
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
 * component is always day-granularity; use `InlineEditDateTime` for date+time.
 */
export interface InlineEditDateProps
  extends Omit<
    DateInputProps,
    'value' | 'onChange' | 'granularity' | 'showTimeDropdown' | 'timeStep'
  > {
  /**
   * Bound-root pattern: `InlineEditDate` IS the prewired `Calendar` root —
   * the `DateValue[]` adapter, `defaultOpen`/`closeOnSelect`, and
   * commit-on-close all stay on the root regardless of composition.
   * `children` are ordinary `Calendar` compound parts (`CalendarTrigger`,
   * `CalendarContent > CalendarBody > …`) rendered inside that root, not a
   * replacement wrapper. Composing children means the consumer owns their
   * own testids/attributes on their own parts — the shared `input` testId
   * slot below only lands on the default `DateInput` trigger.
   *
   * No children → the default composition renders (segmented `DateInput`
   * trigger + grids).
   */
  children?: ReactNode;
}

export const InlineEditDate: FC<InlineEditDateProps> = ({
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
      closeOnSelect
      value={value ? [value] : []}
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
              value={toReactAriaDateValue(value ?? null)}
              onChange={v => setValue(toCalendarDateValue(v))}
              granularity='day'
              showIcon={showIcon}
            />
          </CalendarTrigger>
          <CalendarContent>
            <CalendarBody>
              <CalendarGrids />
            </CalendarBody>
          </CalendarContent>
        </>
      )}
    </CalendarRoot>
  );
};

InlineEditDate.displayName = 'InlineEditDate';
