import type { HTMLAttributes, Ref } from 'react';
import type { DateValue } from '@react-aria/datepicker';
import type { RangeValue } from '@react-types/shared';
import type { TestableProps } from '../../utils/testId';
import type { TemporalGranularity } from '../TemporalCore';

/**
 * Visual size of the date range input. Mirrors InputGroup sizes.
 */
export type DateRangeInputSize = 'default' | 'medium' | 'small';

/**
 * Props shared between the integrated `DateRangeInput` and the compound
 * `DateRangeProvider`. Extends `HTMLAttributes<HTMLDivElement>` so the outer
 * wrapper accepts `id`, `style`, `aria-*`, `data-*`, event handlers; omits
 * `onChange` and `defaultValue` because range inputs redefine them with
 * domain-specific value types.
 */
interface DateRangeCommonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    TestableProps {
  /** Controlled value — range with start and end dates. */
  value?: RangeValue<DateValue> | null;
  /** Default value for uncontrolled mode. */
  defaultValue?: RangeValue<DateValue> | null;
  /** Callback fired when the range value changes. Receives `null` on clear. */
  onChange?: (value: RangeValue<DateValue> | null) => void;
  /** Whether to show the leading calendar icon. Default: true. */
  showIcon?: boolean;
  /** Whether the input has an error state. Sets `aria-invalid` and error styling. */
  error?: boolean;
  /** Whether the input is disabled. Prevents user interaction. */
  disabled?: boolean;
  /** Whether the input is read-only. Segments are focusable but not editable. */
  readOnly?: boolean;
  /** Placeholder shown when no value is selected. */
  placeholder?: string;
  /** Visual size. Default: 'default' (36px). */
  size?: DateRangeInputSize;
  ref?: Ref<HTMLDivElement>;
}

interface DateRangeTimeProps {
  /**
   * Hour cycle for time display — 12-hour (AM/PM) or 24-hour.
   * When omitted, the browser locale decides.
   */
  hourCycle?: 12 | 24;
  /** Show dropdown for time selection with arrow navigation. */
  showTimeDropdown?: boolean;
  /** Time interval in minutes for dropdown options. Default: 30. */
  timeStep?: number;
}

type DateOnlyGranularity = {
  granularity?: 'day';
  hourCycle?: never;
  showTimeDropdown?: never;
  timeStep?: never;
};

type DateTimeGranularity = {
  granularity: Exclude<TemporalGranularity, 'day'>;
} & DateRangeTimeProps;

export type DateRangeInputProps = DateRangeCommonProps &
  (DateOnlyGranularity | DateTimeGranularity);

/**
 * Flattened shape accepted internally after the discriminated-union cast.
 * Not exported — callers use `DateRangeInputProps`.
 */
export type DateRangeInputFlatProps = DateRangeCommonProps & {
  granularity?: TemporalGranularity;
} & DateRangeTimeProps;
