import {
  type FC,
  type FocusEvent,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CalendarDateTime, createCalendar, getLocalTimeZone, now } from '@internationalized/date';
import { composeRefs } from '@radix-ui/react-compose-refs';
import type { TimeValue } from '@react-aria/datepicker';
import { useDateField } from '@react-aria/datepicker';
import { useLocale } from '@react-aria/i18n';
import { useDateFieldState } from '@react-stately/datepicker';
import type { AriaDatePickerProps, DateValue } from '@react-types/datepicker';
import { cn } from '../../utils/cn';
import {
  TemporalSegmentGroup,
  TimeDropdown,
  type TimeDropdownHandle,
  useTimeDropdownKeyCapture,
} from '../TemporalCore';
import { useDateRangeContext } from './DateRangeContext';

export interface DateRangeSegmentGroupProps extends AriaDatePickerProps<DateValue> {
  type: 'start' | 'end';
  /** Called when partial value presence changes (any editable segment is filled). */
  onHasPartialValueChange?: (hasPartialValue: boolean) => void;
  ref?: Ref<HTMLDivElement>;
}

export const DateRangeSegmentGroup: FC<DateRangeSegmentGroupProps> = ({
  type,
  onHasPartialValueChange,
  ref,
  ...props
}) => {
  const {
    state: rangeState,
    disabled = false,
    error = false,
    readOnly = false,
    showTimeDropdown,
    timeStep = 30,
    hourCycle,
    icon,
  } = useDateRangeContext();
  const { locale } = useLocale();

  const dropdownRef = useRef<TimeDropdownHandle>(null);
  const internalRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fieldState = useDateFieldState({
    ...props,
    locale,
    createCalendar,
    hourCycle,
    shouldForceLeadingZeros: true,
  });

  const { fieldProps } = useDateField(props, fieldState, internalRef);

  const hasPartialValue = fieldState.segments.some(seg => seg.isEditable && !seg.isPlaceholder);

  useEffect(() => {
    onHasPartialValueChange?.(hasPartialValue);
  }, [hasPartialValue, onHasPartialValueChange]);

  const hasTimeSegments = fieldState.segments.some(
    seg => seg.type === 'hour' || seg.type === 'minute',
  );

  const handleContainerFocus = () => {
    if (showTimeDropdown && hasTimeSegments) {
      setIsDropdownOpen(true);
    }
  };

  const handleContainerBlur = (e: FocusEvent<HTMLDivElement>) => {
    // Keep the dropdown open while focus moves between descendants
    // (segment → segment, or segment → dropdown item).
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDropdownOpen(false);
    }
  };

  const handleClick = () => {
    if (showTimeDropdown && hasTimeSegments && !isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  };

  const handleTimeSelect = useCallback(
    (timeValue: TimeValue) => {
      const current = fieldState.value;
      // `hour` in value narrows DateValue → CalendarDateTime | ZonedDateTime,
      // whose `.set({ hour, minute, ... })` signatures are compatible.
      const next =
        current && 'hour' in current
          ? current.set({
              hour: timeValue.hour,
              minute: timeValue.minute,
              second: 0,
              millisecond: 0,
            })
          : anchorTimeToToday(timeValue);
      rangeState.setDateTime(type, next);
      setIsDropdownOpen(false);
    },
    [fieldState.value, rangeState, type],
  );

  const handleKeyDownCapture = useTimeDropdownKeyCapture({
    enabled: Boolean(showTimeDropdown),
    isOpen: isDropdownOpen,
    dropdownRef,
    onOpen: () => setIsDropdownOpen(true),
  });

  const currentTimeValue: TimeValue | null =
    fieldState.value && hasTimeSegments ? (fieldState.value as TimeValue) : null;

  const hasIcon = Boolean(icon);

  return (
    <div
      className={cn('relative h-full', !hasIcon && type === 'start' && 'pl-12')}
      onKeyDownCapture={handleKeyDownCapture}
      onClick={handleClick}
      onFocus={handleContainerFocus}
      onBlur={handleContainerBlur}
    >
      <TemporalSegmentGroup
        {...fieldProps}
        ref={composeRefs(internalRef, ref)}
        data-slot='input'
        className={cn('h-full')}
        aria-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        data-field-type={type}
        state={fieldState}
        disabled={disabled}
        readOnly={readOnly}
        segmentKeyPrefix={`${type}-`}
      />

      {showTimeDropdown && hasTimeSegments && (
        <TimeDropdown
          ref={dropdownRef}
          isOpen={isDropdownOpen}
          timeStep={timeStep}
          hourCycle={hourCycle}
          value={currentTimeValue}
          onSelect={handleTimeSelect}
          onClose={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

/**
 * Anchor a bare time to today — used as the seed CalendarDateTime when the
 * range field hasn't got a value yet but the user picks a time from the dropdown.
 */
function anchorTimeToToday(timeValue: TimeValue): CalendarDateTime {
  const t = now(getLocalTimeZone());
  return new CalendarDateTime(t.year, t.month, t.day, timeValue.hour, timeValue.minute, 0);
}

DateRangeSegmentGroup.displayName = 'DateRangeSegmentGroup';
