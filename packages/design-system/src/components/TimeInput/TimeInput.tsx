import { forwardRef, type RefObject, useRef } from 'react';
import { type AriaTimeFieldProps, type TimeValue, useTimeField } from '@react-aria/datepicker';
import { useLocale } from '@react-aria/i18n';
import { useTimeFieldState } from '@react-stately/datepicker';
import { DateInputInternal } from '../DateInput';
import type { DateInputBaseProps } from '../DateInput/types';
import { useTemporalField } from '../TemporalCore';

export type TimeInputProps = Omit<
  AriaTimeFieldProps<TimeValue>,
  'label' | 'description' | 'errorMessage'
> &
  DateInputBaseProps & {
    /**
     * Determines the smallest unit of time that can be edited.
     * - 'hour': Hours only (default)
     * - 'minute': Hours and minutes
     * - 'second': Hours, minutes, and seconds
     */
    granularity?: 'hour' | 'minute' | 'second';
  };

export const TimeInput = forwardRef<HTMLDivElement, TimeInputProps>(
  (
    {
      icon,
      value: controlledValue,
      defaultValue,
      onChange,
      error = false,
      disabled = false,
      granularity = 'minute',
      placeholder,
      showTimeDropdown,
      timeStep,
      hourCycle,
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

    const state = useTimeFieldState({
      ...props,
      value,
      onChange: handleChange,
      locale,
      granularity,
      hourCycle,
      isDisabled: disabled,
      isInvalid: error,
      shouldForceLeadingZeros: true,
    });

    const { fieldProps } = useTimeField(
      {
        ...props,
        isDisabled: disabled,
        isInvalid: error,
      },
      state,
      finalRef,
    );

    return (
      <div className='min-w-156'>
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
          hourCycle={hourCycle}
        />
      </div>
    );
  },
);

TimeInput.displayName = 'TimeInput';
