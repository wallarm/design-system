import { type FC, type Ref, useRef } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { type TimeValue, useTimeField } from '@react-aria/datepicker';
import { useLocale } from '@react-aria/i18n';
import { useTimeFieldState } from '@react-stately/datepicker';
import { Clock } from '../../icons';
import { cn } from '../../utils/cn';
import { TestIdProvider } from '../../utils/testId';
import { DateInputInternal } from '../DateInput/internal';
import type { DateInputCommonProps, DateInputTimeProps } from '../DateInput/types';
import { getDefaultTemporalPlaceholder } from '../TemporalCore';

type TimeInputGranularity = 'hour' | 'minute' | 'second';

/**
 * Subset of `@react-aria/datepicker`'s `AriaTimeFieldProps` surfaced by TimeInput.
 *
 * Declared explicitly so the DS public type doesn't track React-Aria's evolution.
 */
interface TimeInputAriaSubset {
  value?: TimeValue | null;
  defaultValue?: TimeValue | null;
  onChange?: (value: TimeValue | null) => void;
  minValue?: TimeValue;
  maxValue?: TimeValue;
  placeholderValue?: TimeValue;
  name?: string;
  autoFocus?: boolean;
  /** Marks the field as required in assistive tech and HTML form validation. */
  isRequired?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export type TimeInputProps = DateInputCommonProps &
  TimeInputAriaSubset &
  DateInputTimeProps & {
    /**
     * Smallest editable unit.
     * - 'hour': hours only
     * - 'minute': hours and minutes (default)
     * - 'second': hours, minutes, and seconds
     */
    granularity?: TimeInputGranularity;
  };

export const TimeInput: FC<TimeInputProps> = ({
  'data-testid': testId,
  showIcon = true,
  value: controlledValue,
  defaultValue,
  onChange,
  error = false,
  disabled = false,
  readOnly = false,
  isRequired,
  granularity = 'minute',
  hourCycle,
  showTimeDropdown,
  timeStep = 30,
  placeholder,
  size = 'default',
  minValue,
  maxValue,
  placeholderValue,
  name,
  autoFocus,
  ref,
  ...wrapperProps
}) => {
  const resolvedPlaceholder = placeholder ?? getDefaultTemporalPlaceholder({ isTimeOnly: true });

  const { locale } = useLocale();
  const internalRef = useRef<HTMLDivElement>(null);

  const state = useTimeFieldState({
    value: controlledValue,
    defaultValue,
    onChange,
    minValue,
    maxValue,
    placeholderValue,
    isRequired,
    locale,
    granularity,
    hourCycle,
    isDisabled: disabled,
    isInvalid: error,
    isReadOnly: readOnly,
    shouldForceLeadingZeros: true,
  });

  const { fieldProps } = useTimeField(
    {
      name,
      autoFocus,
      isDisabled: disabled,
      isInvalid: error,
      isReadOnly: readOnly,
      isRequired,
    },
    state,
    internalRef,
  );

  return (
    <div
      {...wrapperProps}
      data-slot='time-input'
      data-testid={testId}
      className={cn('min-w-156', wrapperProps.className)}
    >
      <TestIdProvider value={testId}>
        <DateInputInternal
          {...fieldProps}
          icon={showIcon ? Clock : undefined}
          ref={composeRefs(internalRef, ref)}
          state={state}
          error={error}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={resolvedPlaceholder}
          showTimeDropdown={showTimeDropdown}
          timeStep={timeStep}
          hourCycle={hourCycle}
          size={size}
        />
      </TestIdProvider>
    </div>
  );
};

TimeInput.displayName = 'TimeInput';
