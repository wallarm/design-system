import { type FC, type ReactNode, type Ref, useRef } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { useDateRangePicker } from '@react-aria/datepicker';
import { useDateRangePickerState } from '@react-stately/datepicker';
import { Calendar } from '../../../icons';
import { getDefaultTemporalPlaceholder, useTemporalField } from '../../TemporalCore';
import type { DateRangeInputFlatProps, DateRangeInputProps } from '../types';
import { DateRangeContext } from './context';

/**
 * `DateRangeInputProps` is a discriminated union, so `interface … extends`
 * can't widen it — use an intersection type instead.
 */
type DateRangeProviderProps = DateRangeInputProps & {
  /**
   * Compound children — typically `DateRangeStartValue`, `DateRangeSeparator`,
   * `DateRangeEndValue`, or a custom composition using those + `useDateRangeContext`.
   */
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
};

/**
 * Context provider for the date range compound API.
 *
 * Use this when you need a custom layout around the start/end fields. For
 * the default integrated rendering, use `DateRangeInput` which wraps this.
 *
 * @example
 * <DateRangeProvider value={range} onChange={setRange}>
 *   <DateRangeStartValue />
 *   <DateRangeSeparator />
 *   <DateRangeEndValue />
 * </DateRangeProvider>
 */
export const DateRangeProvider: FC<DateRangeProviderProps> = props => {
  const {
    children,
    ref,
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
    timeStep = 30,
    showIcon = true,
    size = 'default',
  } = props as DateRangeInputFlatProps & { children: ReactNode; ref?: Ref<HTMLDivElement> };

  const resolvedPlaceholder =
    placeholder ?? getDefaultTemporalPlaceholder({ granularity, isRange: true });
  const icon = showIcon ? Calendar : undefined;

  const internalRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { value, onChange: handleChange } = useTemporalField({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const state = useDateRangePickerState({
    value,
    onChange: newValue => handleChange(newValue ?? null),
    isDisabled: disabled,
    isReadOnly: readOnly,
    granularity,
    hourCycle,
    shouldForceLeadingZeros: true,
  });

  const { groupProps, startFieldProps, endFieldProps } = useDateRangePicker(
    {
      value,
      isDisabled: disabled,
      isReadOnly: readOnly,
      granularity,
      hourCycle,
    },
    state,
    internalRef,
  );

  return (
    <DateRangeContext.Provider
      value={{
        finalRef: composeRefs(internalRef, ref),
        startRef,
        endRef,
        groupProps,
        startFieldProps,
        endFieldProps,
        state,
        disabled,
        readOnly,
        error,
        placeholder: resolvedPlaceholder,
        showTimeDropdown,
        timeStep,
        hourCycle,
        icon,
        size,
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
};

DateRangeProvider.displayName = 'DateRangeProvider';
