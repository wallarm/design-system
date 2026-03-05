import { Children, type FC, isValidElement, type ReactNode, useCallback, useEffect } from 'react';
import { DatePicker, type UseDatePickerReturn } from '@ark-ui/react';
import {
  CalendarDate,
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today,
} from '@internationalized/date';
import { CalendarApplyButton } from './CalendarApplyButton';
import { CalendarBody } from './CalendarBody';
import { CalendarContent } from './CalendarContent';
import { CalendarProvider } from './CalendarContext';
import { CalendarFooter } from './CalendarFooter';
import { CalendarFooterControls } from './CalendarFooterControls';
import { CalendarGrids } from './CalendarGrids';
import { CalendarInputHeader } from './CalendarInputHeader';
import { CalendarKeyboardHints } from './CalendarKeyboardHints';
import { CalendarPresets } from './CalendarPresets';
import { CalendarResetButton } from './CalendarResetButton';
import { CalendarTrigger } from './CalendarTrigger';
import type { CalendarType, DateRangePreset, DateValue, PresetConfig } from './types';

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
  /** Calendar type: 'single' for one month, 'double' for two months (range) */
  type?: CalendarType;
  /** Show presets sidebar with quick date selection options (convenience API) */
  showPresets?: boolean;
  /** Show input header with date text inputs (convenience API) */
  showInput?: boolean;
  /** Show footer with Reset and Apply buttons (convenience API) */
  showFooter?: boolean;
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
  /** Callback fired when Apply button is clicked */
  onApply?: (value: DateValue[]) => void;
  /** Callback fired when Reset button is clicked */
  onReset?: () => void;
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
  /** Custom preset configurations for the sidebar (convenience API) */
  presets?: PresetConfig[];
  /** Controlled open state of the calendar popover */
  open?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Callback fired when popover open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to close calendar on date selection. Defaults to true when no footer, false when footer is shown */
  closeOnSelect?: boolean;
  /** Whether calendar is readonly (display only, no date selection allowed). Default: false */
  readonly?: boolean;
  /**
   * Children can be:
   * - A trigger element (convenience API) when using showPresets/showFooter/showInput props
   * - Compound components (CalendarTrigger, CalendarContent, etc.) for full customization
   */
  children?: ReactNode;
}

/** Inner component that uses the DatePicker context for keyboard shortcuts */
const CalendarKeyboardHandlerInner: FC<{
  presets: PresetConfig[];
  api: UseDatePickerReturn;
}> = ({ presets, api }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.key.toUpperCase();
      const preset = presets.find(p => p.shortcut?.toUpperCase() === key);

      if (preset) {
        if (typeof preset.value === 'string') {
          // Named range preset (e.g., 'lastWeek', 'lastMonth')
          const rangeValue = api.getRangePresetValue(preset.value as DateRangePreset);
          api.setValue(rangeValue);
        } else {
          // Direct date array (single date or custom range)
          api.setValue(preset.value);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [api, presets]);

  return null;
};

/** Handles keyboard shortcuts for preset selection */
const CalendarKeyboardHandler: FC<{ presets: PresetConfig[] }> = ({ presets }) => (
  <DatePicker.Context>
    {api => <CalendarKeyboardHandlerInner presets={presets} api={api} />}
  </DatePicker.Context>
);

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

/** Check if children contain compound components */
const hasCompoundChildren = (children: ReactNode): boolean => {
  let found = false;
  Children.forEach(children, child => {
    if (isValidElement(child)) {
      const displayName = (child.type as FC)?.displayName;
      if (displayName === 'CalendarTrigger' || displayName === 'CalendarContent') {
        found = true;
      }
    }
  });
  return found;
};

/**
 * Calendar component for date and date range selection.
 *
 * Supports two usage patterns:
 * 1. Convenience API: Use showPresets, showFooter, showInput props with a trigger element as child
 * 2. Compound pattern: Use CalendarTrigger, CalendarContent, etc. as children for full customization
 *
 * @example
 * // Convenience API
 * <Calendar type='double' showPresets showFooter>
 *   <Button>Select date</Button>
 * </Calendar>
 *
 * @example
 * // Compound pattern
 * <Calendar type='double'>
 *   <CalendarTrigger>
 *     <Button>Select date</Button>
 *   </CalendarTrigger>
 *   <CalendarContent>
 *     <CalendarPresets presets={myPresets} />
 *     <CalendarBody>
 *       <CalendarInputHeader />
 *       <CalendarGrid />
 *     </CalendarBody>
 *     <CalendarFooter>
 *       <CalendarKeyboardHints />
 *       <CalendarFooterControls>
 *         <CalendarResetButton />
 *         <CalendarApplyButton />
 *       </CalendarFooterControls>
 *     </CalendarFooter>
 *   </CalendarContent>
 * </Calendar>
 */
export const Calendar: FC<CalendarProps> = ({
  type = 'single',
  showPresets = false,
  showInput = false,
  showFooter = false,
  showTime = false,
  showKeyboardHints = true,
  value,
  defaultValue,
  onChange,
  onApply,
  onReset,
  minDate,
  maxDate,
  isDateUnavailable,
  disallowDisabledDatesInRange = false,
  presets,
  open,
  defaultOpen,
  onOpenChange,
  closeOnSelect,
  readonly = false,
  children,
}) => {
  const isRange = type === 'double';
  const numOfMonths = isRange ? 2 : 1;

  // Use provided presets or default based on calendar type
  const activePresets = presets ?? (isRange ? DEFAULT_RANGE_PRESETS : DEFAULT_SINGLE_PRESETS);

  // Detect if using compound pattern or convenience API
  const isCompound = hasCompoundChildren(children);

  /** Check if any date in the range is unavailable */
  const hasUnavailableDateInRange = useCallback(
    (start: DateValue, end: DateValue): boolean => {
      if (!isDateUnavailable) return false;

      // Iterate through all dates from start to end
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

          // If end is before start, don't update
          if (endDate.compare(startDate) < 0) {
            return;
          }
        }
      }

      // If disallowDisabledDatesInRange is enabled, check the range
      if (disallowDisabledDatesInRange && isRange && newValue.length === 2) {
        const [start, end] = newValue;
        if (start && end && hasUnavailableDateInRange(start, end)) {
          // Don't update - range contains unavailable dates
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

  // Only pass value to DatePicker if it's defined (controlled mode)
  const isControlled = value !== undefined;

  // Context value for compound components
  const contextValue = {
    type,
    isRange,
    showKeyboardHints,
    showTime,
    readonly,
    showInput,
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
      closeOnSelect={closeOnSelect ?? (!showFooter && !showPresets)}
    >
      <CalendarProvider value={contextValue}>
        {isCompound ? (
          // Compound pattern: render children directly
          children
        ) : (
          // Convenience API: build the calendar structure
          <>
            <CalendarTrigger>{children}</CalendarTrigger>
            <CalendarContent>
              {showPresets && (
                <>
                  <CalendarKeyboardHandler presets={activePresets} />
                  <CalendarPresets presets={activePresets} showShortcuts={showKeyboardHints} />
                </>
              )}
              <CalendarBody>
                {showInput && <CalendarInputHeader />}
                <CalendarGrids />
                {showFooter && (
                  <CalendarFooter>
                    {showKeyboardHints && <CalendarKeyboardHints />}
                    <CalendarFooterControls>
                      <CalendarResetButton onClick={onReset} />
                      <CalendarApplyButton
                        onClick={() => {
                          onApply?.(value || []);
                        }}
                      />
                    </CalendarFooterControls>
                  </CalendarFooter>
                )}
              </CalendarBody>
            </CalendarContent>
          </>
        )}
      </CalendarProvider>
    </DatePicker.Root>
  );
};

Calendar.displayName = 'Calendar';
