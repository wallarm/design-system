import type { FC, Ref, RefObject } from 'react';
import type { DateValue } from '@react-aria/datepicker';
import type { DateRangePickerState } from '@react-stately/datepicker';
import type { AriaDatePickerProps } from '@react-types/datepicker';
import type { GroupDOMAttributes } from '@react-types/shared';
import type { SvgIconProps } from '../../../icons';
import type { TemporalInputSize } from '../../TemporalCore';

export interface DateRangeContextValue {
  groupProps: GroupDOMAttributes;
  startFieldProps: AriaDatePickerProps<DateValue>;
  endFieldProps: AriaDatePickerProps<DateValue>;
  /** Combined ref — consumer's ref + internal RefObject used by react-aria. */
  finalRef: Ref<HTMLDivElement>;
  startRef: RefObject<HTMLDivElement | null>;
  endRef: RefObject<HTMLDivElement | null>;
  state: DateRangePickerState;
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  showTimeDropdown?: boolean;
  timeStep?: number;
  hourCycle?: 12 | 24;
  icon?: FC<SvgIconProps>;
  size?: TemporalInputSize;
}
