import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { TestIdProvider } from '../../utils/testId';
import { DateRangeProvider } from './DateRangeContext';
import { DateRangeInputInternal } from './DateRangeInputInternal';
import type { DateRangeInputFlatProps, DateRangeInputProps } from './types';

/**
 * Date range input with start and end date fields sharing a single border.
 * Supports date-only and date+time granularity via `granularity`.
 * Built on React-Aria's date range picker for keyboard/a11y behavior.
 *
 * For custom layouts around the start/end fields, use the compound API:
 * `DateRangeProvider` + `DateRangeStartValue` / `DateRangeSeparator` /
 * `DateRangeEndValue` + `useDateRangeContext`.
 *
 * Pair with `<Field>` + `<FieldError>` for error messaging — this component
 * does not render error text itself.
 *
 * @example
 * <DateRangeInput value={range} onChange={setRange} />
 *
 * @example
 * // With time — hour cycle comes from DateFormatProvider
 * <DateRangeInput granularity='minute' value={range} onChange={setRange} />
 */
export const DateRangeInput: FC<DateRangeInputProps> = props => {
  const {
    // Wrapper concerns — land on the outer <div>.
    'data-testid': testId,
    className,
    ref,
    // Range concerns — forwarded to DateRangeProvider.
    value,
    defaultValue,
    onChange,
    showIcon,
    error,
    disabled,
    readOnly,
    placeholder,
    size,
    granularity,
    showTimeDropdown,
    timeStep,
    // Everything else (id, style, aria-*, event handlers from HTMLAttributes)
    // goes on the wrapper.
    ...wrapperRest
  } = props as DateRangeInputFlatProps;

  return (
    <div
      {...wrapperRest}
      data-slot='date-range-input'
      data-testid={testId}
      className={cn('min-w-284', className)}
    >
      <TestIdProvider value={testId}>
        <DateRangeProvider
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          showIcon={showIcon}
          error={error}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          size={size}
          {...({ granularity, showTimeDropdown, timeStep } as
            | { granularity?: 'day' }
            | {
                granularity: 'hour' | 'minute' | 'second';
                showTimeDropdown?: boolean;
                timeStep?: number;
              })}
        >
          <DateRangeInputInternal />
        </DateRangeProvider>
      </TestIdProvider>
    </div>
  );
};

DateRangeInput.displayName = 'DateRangeInput';
