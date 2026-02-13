import type { FC } from 'react';
import type { SvgIconProps } from '../../icons';

export interface DateInputBaseProps {
  /** Optional icon component to display at the start of the input */
  icon?: FC<SvgIconProps>;
  /** Whether the input has an error state. Shows error styling when true */
  error?: boolean;
  /** Whether the input is disabled. Prevents user interaction when true */
  disabled?: boolean;
  /** Placeholder text to show when no value is selected */
  placeholder?: string;
  /** Show dropdown for time selection with arrow navigation */
  showTimeDropdown?: boolean;
  /** Time interval in minutes for dropdown options. Default: 30 */
  timeStep?: number;
}
