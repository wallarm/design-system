import { forwardRef, type RefObject, useCallback, useRef, useState } from 'react';
import { CalendarDateTime, createCalendar, getLocalTimeZone, now } from '@internationalized/date';
import type { TimeValue } from '@react-aria/datepicker';
import { useDateField } from '@react-aria/datepicker';
import { useLocale } from '@react-aria/i18n';
import { useDateFieldState } from '@react-stately/datepicker';
import type { AriaDatePickerProps, DateValue } from '@react-types/datepicker';
import { cn } from '../../utils/cn';
import { TemporalPlaceholder, TemporalSegmentGroup, TimeDropdown } from '../TemporalCore';
import { useDateRangeContext } from './DateRangeContext';

export interface DateRangeSegmentGroupProps extends AriaDatePickerProps<DateValue> {
  type: 'start' | 'end';
}

export const DateRangeSegmentGroup = forwardRef<HTMLDivElement, DateRangeSegmentGroupProps>(
  ({ type, ...props }, ref) => {
    const context = useDateRangeContext();
    const {
      disabled = false,
      error = false,
      readOnly = false,
      placeholder,
      showTimeDropdown,
      timeStep = 30,
      icon,
    } = context ?? {};
    const { locale } = useLocale();

    const [isFocused, setIsFocused] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const blurTimeoutRef = useRef<number | null>(null);

    const fieldState = useDateFieldState({
      ...props,
      locale,
      createCalendar,
      shouldForceLeadingZeros: true,
    });

    const { fieldProps } = useDateField(props, fieldState, ref as RefObject<HTMLDivElement>);

    const hasValue = fieldState.value !== null;
    const showPlaceholder = placeholder && !hasValue && !isFocused;

    // Check if input has time segments and date segments
    const hasTimeSegments = fieldState.segments.some(
      seg => seg.type === 'hour' || seg.type === 'minute',
    );
    const hasDateSegments = fieldState.segments.some(
      seg => seg.type === 'year' || seg.type === 'month' || seg.type === 'day',
    );

    const handleFocus = () => {
      setIsFocused(true);
      // Clear any pending blur timeout
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      // Show dropdown when has time segments and showTimeDropdown is enabled
      if (showTimeDropdown && hasTimeSegments) {
        setIsDropdownOpen(true);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Delay closing to allow clicks to complete
      blurTimeoutRef.current = window.setTimeout(() => {
        setIsDropdownOpen(false);
      }, 200);
    };

    const handleTimeSelect = useCallback(
      (timeValue: TimeValue) => {
        // Clear blur timeout to prevent delayed close
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
          blurTimeoutRef.current = null;
        }

        if (!context?.state) return;

        if (fieldState.value) {
          const newValue = fieldState.value.set({
            hour: timeValue.hour,
            minute: timeValue.minute,
            second: 0,
            millisecond: 0,
          });
          context.state.setDateTime(type, newValue as any);
        } else if (hasDateSegments) {
          const today = now(getLocalTimeZone());
          const newValue = new CalendarDateTime(
            today.year,
            today.month,
            today.day,
            timeValue.hour,
            timeValue.minute,
            0,
          );
          context.state.setDateTime(type, newValue as any);
        } else {
          fieldState.setValue(timeValue as any);
        }

        // Close dropdown after selection
        setIsDropdownOpen(false);
      },
      [context, fieldState, hasDateSegments, type],
    );

    const currentTimeValue: TimeValue | null =
      fieldState.value && hasTimeSegments ? (fieldState.value as TimeValue) : null;

    // Apply left padding when there's no icon
    // In integrated view, wrapper CSS removes padding from end field
    // In compound pattern, each field is separate and needs padding
    const hasIcon = Boolean(icon);

    return (
      <div className={cn('relative flex-1', !hasIcon && 'pl-12')}>
        {showPlaceholder && (
          <TemporalPlaceholder text={placeholder} className='overflow-hidden text-ellipsis' />
        )}
        <TemporalSegmentGroup
          {...fieldProps}
          ref={ref}
          data-slot='input'
          className={cn('h-36', showPlaceholder && 'opacity-0')}
          aria-disabled={disabled || undefined}
          aria-invalid={error || undefined}
          data-field-type={type}
          state={fieldState}
          disabled={disabled}
          readOnly={readOnly}
          segmentKeyPrefix={`${type}-`}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {showTimeDropdown && hasTimeSegments && (
          <TimeDropdown
            isOpen={isDropdownOpen}
            timeStep={timeStep}
            value={currentTimeValue}
            onSelect={handleTimeSelect}
            onClose={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    );
  },
);

DateRangeSegmentGroup.displayName = 'DateRangeSegmentField';
