import { type FC, type MutableRefObject, useCallback, useReducer } from 'react';
import { DatePicker, type UseDatePickerReturn } from '@ark-ui/react';
import type { DateValue as ReactAriaDateValue } from '@react-aria/datepicker';
import { cn } from '../../utils/cn';
import { DateInput } from '../DateInput';
import { useCalendarContext } from './CalendarContext';
import { sameDate, toArkDateValue, toReactAriaDateValue, withTime } from './dateValue';
import type { DateValue } from './types';

export interface CalendarInputHeaderProps {
  /** Additional className for styling */
  className?: string;
}

const SingleDateInputInner: FC<{
  api: UseDatePickerReturn;
  readonly?: boolean;
  showTime?: boolean;
  timeRef?: MutableRefObject<{ hour: number; minute: number }>;
  commitValue?: (value: DateValue[]) => void;
}> = ({ api, readonly, showTime, timeRef, commitValue }) => {
  // Time lives in `timeRef` (a ref, so `Calendar` can read it synchronously).
  // A time-only edit may not trigger any other state change (uncontrolled, or
  // a consumer that ignores `onChange`), so force a re-render to reflect it.
  const [, bumpTime] = useReducer((n: number) => n + 1, 0);

  const handleChange = useCallback(
    (newValue: ReactAriaDateValue | null) => {
      const arkValue = toArkDateValue(newValue);
      if (arkValue) {
        api.setValue([arkValue]);
      } else {
        api.clearValue();
      }
    },
    [api],
  );

  const handleDateTimeChange = useCallback(
    (newValue: ReactAriaDateValue | null) => {
      // Record the chosen time so a later grid pick (date-only) keeps it.
      // `Calendar`'s `withTrackedTime` reads the same ref to promote grid picks.
      if (newValue && 'hour' in newValue && timeRef) {
        timeRef.current = { hour: newValue.hour, minute: newValue.minute };
      }
      // A time-only edit keeps the date; Ark dedupes same-date values and would
      // drop it, so commit straight to the consumer. A date change goes through
      // Ark so the grid and view stay in sync.
      if (newValue && sameDate(api.value[0], newValue)) {
        const arkValue = toArkDateValue(newValue);
        if (arkValue) commitValue?.([arkValue]);
        bumpTime();
      } else {
        handleChange(newValue);
      }
    },
    [api, handleChange, timeRef, commitValue],
  );

  // Null (not undefined) keeps the DateInput controlled when empty.
  const inputValue = toReactAriaDateValue(api.value[0]);
  const time = timeRef?.current ?? { hour: 0, minute: 0 };
  // Rebuild date + tracked time: Ark owns only the date, so the time must come
  // from timeRef; minute granularity also rejects a date-only value.
  const dateTimeValue = inputValue ? toReactAriaDateValue(withTime(inputValue, time)) : null;

  return (
    <div className='flex flex-1' onKeyDown={e => e.stopPropagation()}>
      {showTime ? (
        <DateInput
          value={dateTimeValue}
          onChange={handleDateTimeChange}
          readOnly={readonly}
          granularity='minute'
          showTimeDropdown
        />
      ) : (
        <DateInput
          value={inputValue}
          onChange={handleChange}
          readOnly={readonly}
          granularity='day'
        />
      )}
    </div>
  );
};

/**
 * Inner component for date range input that syncs with Ark UI DatePicker.
 * Shows TWO SEPARATE DateInput boxes with arrow separator between them.
 * Uses controlled mode for reliable sync.
 * Arrow is absolutely positioned per Figma design.
 */
const RangeDateInputInner: FC<{
  api: UseDatePickerReturn;
  readonly?: boolean;
}> = ({ api, readonly }) => {
  // Access api.value directly in callbacks to always get fresh values
  const handleStartChange = useCallback(
    (newValue: ReactAriaDateValue | null) => {
      const arkValue = toArkDateValue(newValue);
      // Get current end value directly from api to avoid stale closure
      const currentEnd = api.value[1];

      if (arkValue && currentEnd) {
        api.setValue([arkValue, currentEnd]);
      } else if (arkValue) {
        api.setValue([arkValue]);
      } else if (currentEnd) {
        api.setValue([currentEnd]);
      } else {
        api.clearValue();
      }
    },
    [api],
  );

  const handleEndChange = useCallback(
    (newValue: ReactAriaDateValue | null) => {
      const arkValue = toArkDateValue(newValue);
      // Get current start value directly from api to avoid stale closure
      const currentStart = api.value[0];

      if (arkValue && currentStart) {
        api.setValue([currentStart, arkValue]);
      } else if (arkValue) {
        api.setValue([arkValue]);
      } else if (currentStart) {
        api.setValue([currentStart]);
      } else {
        api.clearValue();
      }
    },
    [api],
  );

  // Use null for controlled mode when no value (not undefined)
  const startValue = toReactAriaDateValue(api.value[0]);
  const endValue = toReactAriaDateValue(api.value[1]);

  return (
    <div className='relative flex flex-1 items-center gap-4' onKeyDown={e => e.stopPropagation()}>
      <DateInput
        value={startValue}
        onChange={handleStartChange}
        readOnly={readonly}
        granularity='day'
      />
      <span
        className='flex items-center justify-center shrink-0 basis-20 font-sans text-sm leading-sm text-text-secondary'
        aria-hidden='true'
      >
        →
      </span>
      <DateInput
        value={endValue}
        onChange={handleEndChange}
        readOnly={readonly}
        granularity='day'
      />
    </div>
  );
};

/**
 * Header with date input fields for the calendar.
 * Shows DateInput for single mode, two separate DateInputs with arrow separator for range mode.
 * Uses the actual DateInput components with full segment-based editing.
 * Automatically determines mode from CalendarContext.
 */
export const CalendarInputHeader: FC<CalendarInputHeaderProps> = ({ className }) => {
  const { isRange, readonly, showTime, timeRef, commitValue } = useCalendarContext();

  return (
    <div className={cn('flex flex-1 items-center', 'pt-20 pb-4 px-20', className)}>
      <DatePicker.Context>
        {api =>
          isRange ? (
            <RangeDateInputInner api={api} readonly={readonly} />
          ) : (
            <SingleDateInputInner
              api={api}
              readonly={readonly}
              showTime={showTime}
              timeRef={timeRef}
              commitValue={commitValue}
            />
          )
        }
      </DatePicker.Context>
    </div>
  );
};

CalendarInputHeader.displayName = 'CalendarInputHeader';
