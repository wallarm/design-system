import type { HTMLAttributes } from 'react';
import type { TestableProps } from '../../utils/testId';

/**
 * Visual size of the date/time input. Mirrors InputGroup sizes.
 */
export type DateInputSize = 'default' | 'medium' | 'small';

/**
 * Props shared by DateInput and TimeInput root wrappers.
 *
 * `HTMLAttributes<HTMLDivElement>` provides `id`, `style`, `aria-*`, `data-*`,
 * mouse/keyboard handlers and friends on the root wrapper. `onChange` and
 * `defaultValue` are omitted because date/time inputs redefine them with
 * domain-specific value types.
 */
export interface DateInputCommonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    TestableProps {
  /** Whether to show the leading icon. Default: true. */
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
  size?: DateInputSize;
}

/**
 * Props describing time-segment behaviour. Applied when the input surfaces
 * time segments — TimeInput, or DateInput with a time granularity.
 */
export interface DateInputTimeProps {
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
