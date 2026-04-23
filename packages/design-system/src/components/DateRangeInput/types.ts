import type { Ref } from 'react';
import type { DateValue } from '@react-aria/datepicker';
import type { RangeValue } from '@react-types/shared';
import type {
  TemporalGranularity,
  TemporalInputCommonProps,
  TemporalInputTimeProps,
} from '../TemporalCore';

interface DateRangeValueProps {
  /** Controlled value — range with start and end dates. */
  value?: RangeValue<DateValue> | null;
  /** Default value for uncontrolled mode. */
  defaultValue?: RangeValue<DateValue> | null;
  /** Callback fired when the range value changes. Receives `null` on clear. */
  onChange?: (value: RangeValue<DateValue> | null) => void;
  ref?: Ref<HTMLDivElement>;
}

type DateOnlyGranularity = {
  granularity?: 'day';
  hourCycle?: never;
  showTimeDropdown?: never;
  timeStep?: never;
};

type DateTimeGranularity = {
  granularity: Exclude<TemporalGranularity, 'day'>;
} & TemporalInputTimeProps;

export type DateRangeInputProps = TemporalInputCommonProps &
  DateRangeValueProps &
  (DateOnlyGranularity | DateTimeGranularity);

/**
 * Flattened shape accepted internally after the discriminated-union cast.
 * Not exported — callers use `DateRangeInputProps`.
 */
export type DateRangeInputFlatProps = TemporalInputCommonProps &
  DateRangeValueProps & {
    granularity?: TemporalGranularity;
  } & TemporalInputTimeProps;
