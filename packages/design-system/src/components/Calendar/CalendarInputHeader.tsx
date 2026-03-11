import { type FC, useCallback } from 'react';
import { DatePicker, type UseDatePickerReturn } from '@ark-ui/react';
import type { DateValue as ReactAriaDateValue } from '@react-aria/datepicker';
import { ArrowRight } from '../../icons';
import { cn } from '../../utils/cn';
import { DateInput } from '../DateInput';
import { useCalendarContext } from './CalendarContext';
import type { DateValue } from './types';

export interface CalendarInputHeaderProps {
  /** Additional className for styling */
  className?: string;
}

/**
 * Converts Ark UI DateValue to React Aria DateValue.
 * Both use @internationalized/date internally, so we can cast directly.
 */
const toReactAriaDateValue = (date: DateValue | undefined): ReactAriaDateValue | null => {
  if (!date) return null;
  return date as unknown as ReactAriaDateValue;
};

/**
 * Converts React Aria DateValue to Ark UI DateValue.
 */
const toArkDateValue = (date: ReactAriaDateValue | null | undefined): DateValue | undefined => {
  if (!date) return undefined;
  return date as unknown as DateValue;
};

/**
 * Inner component for single date input that syncs with Ark UI DatePicker.
 * Uses controlled mode for reliable sync.
 */
const SingleDateInputInner: FC<{
  api: UseDatePickerReturn;
  readonly?: boolean;
}> = ({ api, readonly }) => {
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

  // Use null for controlled mode when no value (not undefined)
  const inputValue = toReactAriaDateValue(api.value[0]);

  return (
    <div className='flex flex-1' onKeyDown={e => e.stopPropagation()}>
      <DateInput
        value={inputValue}
        onChange={handleChange}
        isReadOnly={readonly}
        granularity='day'
      />
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
    <div className='relative flex flex-1 items-center gap-28' onKeyDown={e => e.stopPropagation()}>
      <DateInput
        value={startValue}
        onChange={handleStartChange}
        isReadOnly={readonly}
        granularity='day'
      />
      {/* Arrow positioned absolutely in center per Figma design */}
      <span
        className='absolute left-1/2 -translate-x-1/2 text-text-secondary select-none'
        aria-hidden='true'
      >
        <ArrowRight size='md' />
      </span>
      <DateInput
        value={endValue}
        onChange={handleEndChange}
        isReadOnly={readonly}
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
  const { isRange, readonly } = useCalendarContext();

  return (
    <div className={cn('flex flex-1 items-center', 'pt-20 pb-4 px-20', className)}>
      <DatePicker.Context>
        {api =>
          isRange ? (
            <RangeDateInputInner api={api} readonly={readonly} />
          ) : (
            <SingleDateInputInner api={api} readonly={readonly} />
          )
        }
      </DatePicker.Context>
    </div>
  );
};

CalendarInputHeader.displayName = 'CalendarInputHeader';
