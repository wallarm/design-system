import { type RefObject, useCallback, useRef } from 'react';
import { withTime } from './dateValue';
import type { DateValue } from './types';

interface UseCalendarTimeParams {
  showTime: boolean;
  isRange: boolean;
  value?: DateValue[];
  defaultValue?: DateValue[];
  onChange?: (value: DateValue[]) => void;
}

interface UseCalendarTime {
  /** Last-known time-of-day; read synchronously when promoting grid picks. */
  timeRef: RefObject<{ hour: number; minute: number }>;
  /** Emit to the consumer, promoting date-only values to `CalendarDateTime`. */
  commitValue: (value: DateValue[]) => void;
}

/**
 * Time handling for single `showTime` mode. The grid emits date-only values and
 * Ark keys its value by date, so time must be tracked here and merged in before
 * reaching `onChange`.
 */
export const useCalendarTime = ({
  showTime,
  isRange,
  value,
  defaultValue,
  onChange,
}: UseCalendarTimeParams): UseCalendarTime => {
  const timeRef = useRef({ hour: 0, minute: 0 });

  // Sync the tracked time from the current value so a grid pick re-applies it
  // rather than resetting to midnight. Safe in render only because this write is
  // idempotent — never derive timeRef from its own previous value here.
  if (showTime && !isRange) {
    const current = (value ?? defaultValue)?.[0];
    if (current && 'hour' in current) {
      timeRef.current = { hour: current.hour, minute: current.minute };
    }
  }

  const withTrackedTime = useCallback((date: DateValue): DateValue => {
    if ('hour' in date) {
      timeRef.current = { hour: date.hour, minute: date.minute };
      return date;
    }
    return withTime(date, timeRef.current);
  }, []);

  const commitValue = useCallback(
    (next: DateValue[]) => {
      onChange?.(showTime && !isRange ? next.map(withTrackedTime) : next);
    },
    [showTime, isRange, withTrackedTime, onChange],
  );

  return { timeRef, commitValue };
};
