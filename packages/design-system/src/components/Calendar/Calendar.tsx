import { type FC, type ReactNode, useCallback } from 'react';
import { DatePicker } from '@ark-ui/react';
import {
  CalendarDate,
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today,
} from '@internationalized/date';
import { CalendarProvider } from './CalendarContext';
import type { CalendarType, DateValue, PresetConfig } from './types';

// Type assertion helper (workaround for @internationalized/date version mismatch with @ark-ui/react)
const toDateValue = <T,>(date: T): DateValue => date as unknown as DateValue;

/** Get full month range (1st to last day) */
const getThisMonthRange = (): DateValue[] => {
  const now = today(getLocalTimeZone());
  return [toDateValue(startOfMonth(now)), toDateValue(endOfMonth(now))];
};

/** Get a single date relative to today */
const getRelativeDate = (daysAgo: number): DateValue[] => {
  const now = today(getLocalTimeZone());
  return [toDateValue(now.subtract({ days: daysAgo }))];
};

/** Get first day of current month */
const getFirstOfThisMonth = (): DateValue[] => {
  const now = today(getLocalTimeZone());
  return [toDateValue(startOfMonth(now))];
};

/** Get first day of previous month */
const getFirstOfLastMonth = (): DateValue[] => {
  const now = today(getLocalTimeZone());
  return [toDateValue(startOfMonth(now.subtract({ months: 1 })))];
};

export interface CalendarProps {
  /** Calendar type: 'single' for one month, 'range' for two months (date range selection) */
  type?: CalendarType;
  /** Show time selection (affects input placeholder text) */
  showTime?: boolean;
  /** Show keyboard shortcut hints in presets and footer */
  showKeyboardHints?: boolean;
  /** Controlled value - array of selected dates */
  value?: DateValue[];
  /** Default value for uncontrolled mode */
  defaultValue?: DateValue[];
  /** Callback fired when selected value changes */
  onChange?: (value: DateValue[]) => void;
  /** Minimum selectable date */
  minDate?: DateValue;
  /** Maximum selectable date */
  maxDate?: DateValue;
  /**
   * Function to determine if a specific date should be unavailable/disabled.
   * DateValue has year, month (1-12), and day properties.
   * To get day of week, use: new Date(date.year, date.month - 1, date.day).getDay()
   * where Sunday = 0, Saturday = 6.
   */
  isDateUnavailable?: (date: DateValue) => boolean;
  /**
   * When true, prevents selecting a range that contains any unavailable dates.
   * Requires controlled mode (value + onChange props) to work properly.
   */
  disallowDisabledDatesInRange?: boolean;
  /** Controlled open state of the calendar popover */
  open?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Callback fired when popover open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to close calendar on date selection. Default: true */
  closeOnSelect?: boolean;
  /** Whether calendar is readonly (display only, no date selection allowed). Default: false */
  readonly?: boolean;
  /** Compound components (CalendarTrigger, CalendarContent, etc.) */
  children?: ReactNode;
}

/** Default presets for single date selection */
export const DEFAULT_SINGLE_PRESETS: PresetConfig[] = [
  { label: 'Today', value: getRelativeDate(0), shortcut: 'T' },
  { label: 'Yesterday', value: getRelativeDate(1), shortcut: 'Y' },
  { label: '1 week ago', value: getRelativeDate(7), shortcut: 'W' },
  { label: '2 weeks ago', value: getRelativeDate(14), shortcut: '2' },
  { label: '1st of this month', value: getFirstOfThisMonth(), shortcut: 'M' },
  { label: '1st of last month', value: getFirstOfLastMonth(), shortcut: 'L' },
  { label: '1 month ago', value: getRelativeDate(30), shortcut: '3' },
  { label: '3 months ago', value: getRelativeDate(90), shortcut: '9' },
];

/** Default presets for range selection */
export const DEFAULT_RANGE_PRESETS: PresetConfig[] = [
  { label: 'Today', value: 'last3Days', shortcut: 'T' },
  { label: 'Last week', value: 'lastWeek', shortcut: 'W' },
  { label: 'Last 2 weeks', value: 'last14Days', shortcut: '2' },
  { label: 'This month', value: getThisMonthRange(), shortcut: 'M' },
  { label: 'Last month', value: 'lastMonth', shortcut: 'L' },
  { label: 'Last 3 months', value: 'lastQuarter', shortcut: '3' },
  { label: 'Last 90 days', value: 'last90Days', shortcut: '9' },
];

/**
 * Calendar component for date and date range selection.
 *
 * Uses compound pattern — compose sub-components for full control:
 * ```tsx
 * <Calendar type='range'>
 *   <CalendarTrigger>
 *     <Button>Select date</Button>
 *   </CalendarTrigger>
 *   <CalendarContent>
 *     <CalendarPresets presets={myPresets} />
 *     <CalendarBody>
 *       <CalendarInputHeader />
 *       <CalendarGrids />
 *       <CalendarFooter>
 *         <CalendarKeyboardHints />
 *         <CalendarFooterControls>
 *           <CalendarResetButton />
 *           <CalendarApplyButton />
 *         </CalendarFooterControls>
 *       </CalendarFooter>
 *     </CalendarBody>
 *   </CalendarContent>
 * </Calendar>
 * ```
 */
export const Calendar: FC<CalendarProps> = ({
  type = 'single',
  showTime = false,
  showKeyboardHints = true,
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  isDateUnavailable,
  disallowDisabledDatesInRange = false,
  open,
  defaultOpen,
  onOpenChange,
  closeOnSelect = true,
  readonly = false,
  children,
}) => {
  const isRange = type === 'range';
  const numOfMonths = isRange ? 2 : 1;

  /** Check if any date in the range is unavailable */
  const hasUnavailableDateInRange = useCallback(
    (start: DateValue, end: DateValue): boolean => {
      if (!isDateUnavailable) return false;

      let current = new CalendarDate(start.year, start.month, start.day);
      const endDate = new CalendarDate(end.year, end.month, end.day);

      while (current.compare(endDate) <= 0) {
        if (isDateUnavailable(toDateValue(current))) {
          return true;
        }
        current = current.add({ days: 1 });
      }
      return false;
    },
    [isDateUnavailable],
  );

  const handleValueChange = useCallback(
    (details: DatePicker.ValueChangeDetails) => {
      const newValue = details.value;

      // Ensure end date is not before start date for ranges
      if (isRange && newValue.length === 2) {
        const [start, end] = newValue;
        if (start && end) {
          const startDate = new CalendarDate(start.year, start.month, start.day);
          const endDate = new CalendarDate(end.year, end.month, end.day);

          if (endDate.compare(startDate) < 0) {
            return;
          }
        }
      }

      // If disallowDisabledDatesInRange is enabled, check the range
      if (disallowDisabledDatesInRange && isRange && newValue.length === 2) {
        const [start, end] = newValue;
        if (start && end && hasUnavailableDateInRange(start, end)) {
          return;
        }
      }

      onChange?.(newValue);
    },
    [onChange, disallowDisabledDatesInRange, isRange, hasUnavailableDateInRange],
  );

  const handleOpenChange = useCallback(
    (details: { open: boolean }) => {
      onOpenChange?.(details.open);
    },
    [onOpenChange],
  );

  const isControlled = value !== undefined;

  const contextValue = {
    type,
    isRange,
    showKeyboardHints,
    showTime,
    readonly,
  };

  return (
    <DatePicker.Root
      selectionMode={isRange ? 'range' : 'single'}
      numOfMonths={numOfMonths}
      value={isControlled ? value : undefined}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      min={minDate}
      max={maxDate}
      isDateUnavailable={isDateUnavailable}
      outsideDaySelectable
      closeOnSelect={closeOnSelect}
    >
      <CalendarProvider value={contextValue}>{children}</CalendarProvider>
    </DatePicker.Root>
  );
};

Calendar.displayName = 'Calendar';
