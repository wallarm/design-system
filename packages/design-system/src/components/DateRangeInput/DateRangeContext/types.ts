import type { FC, RefObject } from 'react';
import type { DateValue } from '@react-aria/datepicker';
import type { DateRangePickerState } from '@react-stately/datepicker';
import type { AriaDatePickerProps } from '@react-types/datepicker';
import type { GroupDOMAttributes } from '@react-types/shared';
import type { SvgIconProps } from '../../../icons';

export interface DateRangeContextValue {
  groupProps: GroupDOMAttributes;
  startFieldProps: AriaDatePickerProps<DateValue>;
  endFieldProps: AriaDatePickerProps<DateValue>;
  finalRef: RefObject<HTMLDivElement | null>;
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
  icon?: FC<SvgIconProps>;
}
