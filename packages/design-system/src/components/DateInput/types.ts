import type { InputGroupSize } from '../InputGroup';

export interface DateInputBaseProps {
  /** Whether to show the leading icon. Default: true */
  showIcon?: boolean;
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
  /** Hour cycle for time display: 12-hour (AM/PM) or 24-hour format */
  hourCycle?: 12 | 24;
  /** Visual size of the input. Default: 'default' (36px) */
  size?: InputGroupSize;

  /**
   * className prop
   */
  className?: string;
}
