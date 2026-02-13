import type { FC } from 'react';
import type { DateValue } from '@react-aria/datepicker';
import type { RangeValue } from '@react-types/shared';
import type { SvgIconProps } from '../../icons';

export interface DateRangeBaseProps {
  /** Optional icon component to display at the start of the input */
  icon?: FC<SvgIconProps>;
  /** Whether the input has an error state. Shows error styling when true */
  error?: boolean;
  /** Whether the input is disabled. Prevents user interaction when true */
  disabled?: boolean;
  /** Whether the input is read-only. Displays value but prevents editing */
  readOnly?: boolean;
  /** Placeholder text to show when no value is selected */
  placeholder?: string;
  /** Show dropdown for time selection with arrow navigation */
  showTimeDropdown?: boolean;
  /** Time interval in minutes for dropdown options. Default: 30 */
  timeStep?: number;
}

export interface DateRangeInputProps extends DateRangeBaseProps {
  /** Controlled value - range with start and end dates */
  value?: RangeValue<DateValue> | null;
  /** Default value for uncontrolled mode */
  defaultValue?: RangeValue<DateValue> | null;
  /** Callback fired when the range value changes */
  onChange?: (value: RangeValue<DateValue> | null) => void;
  /**
   * Determines the smallest unit of time that can be edited.
   * - 'day': Date only (default)
   * - 'hour': Date with hours
   * - 'minute': Date with hours and minutes
   * - 'second': Date with hours, minutes, and seconds
   */
  granularity?: 'day' | 'hour' | 'minute' | 'second';
  /** Hour cycle for time display: 12-hour or 24-hour format */
  hourCycle?: 12 | 24;
}
