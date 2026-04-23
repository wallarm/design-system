import type { HTMLAttributes } from 'react';
import type { TestableProps } from '../../utils/testId';

/**
 * Visual size of a temporal input. Mirrors InputGroup sizes.
 */
export type TemporalInputSize = 'default' | 'medium' | 'small';

/**
 * Props shared by every temporal input root wrapper — DateInput, TimeInput,
 * DateRangeInput. Extends `HTMLAttributes<HTMLDivElement>` so consumers can
 * set `id`, `style`, `aria-*`, `data-*`, event handlers on the outer element.
 * `onChange` and `defaultValue` are omitted because each input redefines
 * them with its domain-specific value type.
 */
export interface TemporalInputCommonProps
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
  size?: TemporalInputSize;
}

/**
 * Props describing time-segment behaviour. Applied when the input surfaces
 * time segments — TimeInput, or DateInput / DateRangeInput with a time
 * granularity.
 */
export interface TemporalInputTimeProps {
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
