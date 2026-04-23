import { type FC, type Ref, useRef } from 'react';
import { createCalendar } from '@internationalized/date';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { type DateValue, useDateField } from '@react-aria/datepicker';
import { useLocale } from '@react-aria/i18n';
import { useDateFieldState } from '@react-stately/datepicker';
import { Calendar } from '../../icons';
import { cn } from '../../utils/cn';
import { TestIdProvider } from '../../utils/testId';
import { getDefaultTemporalPlaceholder, type TemporalGranularity } from '../TemporalCore';
import { DateInputInternal } from './internal';
import type { DateInputCommonProps, DateInputTimeProps } from './types';

/**
 * Subset of `@react-aria/datepicker`'s `AriaDateFieldProps` surfaced by DateInput.
 *
 * Declared explicitly (not via `Omit<AriaDateFieldProps, ...>`) so the DS public
 * type doesn't track React-Aria's evolution — props are added here intentionally.
 */
interface DateInputAriaSubset {
  value?: DateValue | null;
  defaultValue?: DateValue | null;
  onChange?: (value: DateValue | null) => void;
  minValue?: DateValue;
  maxValue?: DateValue;
  placeholderValue?: DateValue;
  name?: string;
  autoFocus?: boolean;
  /** Marks the field as required in assistive tech and HTML form validation. */
  isRequired?: boolean;
  ref?: Ref<HTMLDivElement>;
}

type DateOnlyGranularity = {
  granularity?: 'day';
  hourCycle?: never;
  showTimeDropdown?: never;
  timeStep?: never;
};

type DateTimeGranularity = {
  granularity: Exclude<TemporalGranularity, 'day'>;
} & DateInputTimeProps;

export type DateInputProps = DateInputCommonProps &
  DateInputAriaSubset &
  (DateOnlyGranularity | DateTimeGranularity);

export const DateInput: FC<DateInputProps> = props => {
  const {
    'data-testid': testId,
    showIcon = true,
    value: controlledValue,
    defaultValue,
    onChange,
    error = false,
    disabled = false,
    readOnly = false,
    isRequired,
    granularity = 'day',
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
  } = props as DateInputCommonProps &
    DateInputAriaSubset & {
      granularity?: TemporalGranularity;
    } & DateInputTimeProps;

  const resolvedPlaceholder = placeholder ?? getDefaultTemporalPlaceholder({ granularity });

  const { locale } = useLocale();
  const internalRef = useRef<HTMLDivElement>(null);

  const state = useDateFieldState({
    value: controlledValue,
    defaultValue,
    onChange,
    minValue,
    maxValue,
    placeholderValue,
    isRequired,
    locale,
    isDisabled: disabled,
    isInvalid: error,
    isReadOnly: readOnly,
    granularity,
    hourCycle,
    createCalendar,
    shouldForceLeadingZeros: true,
  });

  const { fieldProps } = useDateField(
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
      data-slot='date-input'
      data-testid={testId}
      className={cn('min-w-256 flex-1', wrapperProps.className)}
    >
      <TestIdProvider value={testId}>
        <DateInputInternal
          {...fieldProps}
          icon={showIcon ? Calendar : undefined}
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

DateInput.displayName = 'DateInput';
