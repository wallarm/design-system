import { forwardRef, type RefObject, useRef } from 'react';
import { createCalendar } from '@internationalized/date';
import { type AriaDateFieldProps, type DateValue, useDateField } from '@react-aria/datepicker';
import { useLocale } from '@react-aria/i18n';
import { useDateFieldState } from '@react-stately/datepicker';
import { useTemporalField } from '../TemporalCore';
import { DateInputInternal } from './DateInputInternal';
import type { DateInputBaseProps } from './types';

export type DateInputProps = Omit<
  AriaDateFieldProps<DateValue>,
  'label' | 'description' | 'errorMessage'
> &
  DateInputBaseProps & {
    /**
     * Determines the smallest unit of time that can be edited.
     * - 'day': Date only (default)
     * - 'hour': Date with hours
     * - 'minute': Date with hours and minutes
     * - 'second': Date with hours, minutes, and seconds
     */
    granularity?: 'day' | 'hour' | 'minute' | 'second';
  };

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  (
    {
      icon,
      value: controlledValue,
      defaultValue,
      onChange,
      error = false,
      disabled = false,
      granularity = 'day',
      placeholder,
      showTimeDropdown,
      timeStep,
      ...props
    },
    forwardedRef,
  ) => {
    const { locale } = useLocale();
    const ref = useRef<HTMLDivElement>(null);
    const finalRef = (forwardedRef || ref) as RefObject<HTMLDivElement>;

    const { value, onChange: handleChange } = useTemporalField({
      value: controlledValue,
      defaultValue,
      onChange,
    });

    const state = useDateFieldState({
      ...props,
      value,
      onChange: handleChange,
      locale,
      isDisabled: disabled,
      isInvalid: error,
      granularity,
      createCalendar,
      shouldForceLeadingZeros: true,
    });

    const { fieldProps } = useDateField(
      {
        ...props,
        isDisabled: disabled,
        isInvalid: error,
      },
      state,
      finalRef,
    );

    return (
      <DateInputInternal
        {...fieldProps}
        icon={icon}
        ref={finalRef}
        state={state}
        error={error}
        disabled={disabled}
        placeholder={placeholder}
        showTimeDropdown={showTimeDropdown}
        timeStep={timeStep}
      />
    );
  },
);

DateInput.displayName = 'DateInput';
