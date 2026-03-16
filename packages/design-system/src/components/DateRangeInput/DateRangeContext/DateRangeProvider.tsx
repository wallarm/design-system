import { forwardRef, type ReactNode, type RefObject, useCallback, useRef } from 'react';
import { CalendarDate } from '@internationalized/date';
import { useDateRangePicker } from '@react-aria/datepicker';
import { useDateRangePickerState } from '@react-stately/datepicker';
import { useTemporalField } from '../../TemporalCore';
import type { DateRangeInputProps } from '../types';
import { DateRangeContext } from './context';

interface DateRangeProviderProps extends DateRangeInputProps {
  /** Children components (typically DateRangeStartValue, DateRangeSeparator, DateRangeEndValue) */
  children: ReactNode;
}

/**
 * Context provider for date range input compound components.
 * Manages shared state and behavior for start/end date fields.
 * Automatically validates that end date is not before start date.
 *
 * Use this for custom composition of date range inputs with full control over layout.
 *
 * @example
 * // Custom layout with icon and custom separator
 * <DateRangeProvider value={range} onChange={setRange} granularity="minute">
 *   <CalendarIcon />
 *   <DateRangeStartValue />
 *   <span>to</span>
 *   <DateRangeEndValue />
 * </DateRangeProvider>
 */
export const DateRangeProvider = forwardRef<HTMLDivElement, DateRangeProviderProps>(
  (
    {
      children,
      value: controlledValue,
      defaultValue,
      onChange,
      error = false,
      disabled = false,
      readOnly = false,
      granularity = 'day',
      hourCycle,
      placeholder,
      showTimeDropdown,
      timeStep,
      icon,
    },
    forwardedRef,
  ) => {
    const ref = useRef<HTMLDivElement>(null);
    const finalRef = (forwardedRef || ref) as RefObject<HTMLDivElement | null>;
    const startRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    const { value, onChange: handleChange } = useTemporalField({
      value: controlledValue,
      defaultValue,
      onChange,
    });

    // Wrap onChange to validate range order
    const handleChangeWithValidation = useCallback(
      (newValue: typeof value) => {
        // Handle undefined
        if (newValue === undefined) {
          handleChange(null);
          return;
        }

        // Ensure end date is not before start date
        if (newValue?.start && newValue?.end) {
          const startDate = new CalendarDate(
            newValue.start.year,
            newValue.start.month,
            newValue.start.day,
          );
          const endDate = new CalendarDate(newValue.end.year, newValue.end.month, newValue.end.day);

          // If end is before start, don't update
          if (endDate.compare(startDate) < 0) {
            return;
          }
        }

        handleChange(newValue);
      },
      [handleChange],
    );

    const state = useDateRangePickerState({
      value,
      onChange: handleChangeWithValidation,
      isDisabled: disabled,
      isReadOnly: readOnly,
      granularity,
      hourCycle,
      shouldForceLeadingZeros: true,
      shouldCloseOnSelect: false,
    });

    const { groupProps, startFieldProps, endFieldProps } = useDateRangePicker(
      {
        value,
        isDisabled: disabled,
        isReadOnly: readOnly,
        granularity,
        hourCycle,
        shouldForceLeadingZeros: true,
      },
      state,
      finalRef,
    );

    return (
      <DateRangeContext.Provider
        value={{
          finalRef,
          startRef,
          endRef,
          groupProps,
          startFieldProps,
          endFieldProps,
          state,
          disabled,
          readOnly,
          error,
          placeholder,
          showTimeDropdown,
          timeStep,
          icon,
        }}
      >
        {children}
      </DateRangeContext.Provider>
    );
  },
);
