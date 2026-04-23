import { type FC, type Ref, useCallback, useRef, useState } from 'react';
import { CalendarDateTime, getLocalTimeZone, now } from '@internationalized/date';
import type { TimeValue } from '@react-aria/datepicker';
import type { DateFieldState, TimeFieldState } from '@react-stately/datepicker';
import type { GroupDOMAttributes } from '@react-types/shared';
import type { SvgIconProps } from '../../../icons';
import { cn } from '../../../utils/cn';
import { InputGroup, InputGroupAddon } from '../../InputGroup';
import {
  TemporalClear,
  type TemporalInputSize,
  type TemporalInputTimeProps,
  TemporalPlaceholder,
  TemporalSegmentGroup,
  TimeDropdown,
  type TimeDropdownHandle,
  useTimeDropdownKeyCapture,
} from '../../TemporalCore';

/**
 * Internal props — intentionally narrow. `TemporalInputCommonProps` is not
 * extended here because it pulls in `HTMLAttributes<HTMLDivElement>`, whose
 * `onAbort` handler collides with the one in `@react-types/shared`'s
 * `GroupDOMAttributes`. The outer `DateInput` / `TimeInput` wrappers own the
 * HTML-attribute surface; this internal only consumes the specific concerns
 * it actually renders.
 */
interface DateInputInternalProps extends GroupDOMAttributes, TemporalInputTimeProps {
  state: DateFieldState | TimeFieldState;
  icon?: FC<SvgIconProps>;
  ref?: Ref<HTMLDivElement>;
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  size?: TemporalInputSize;
  /**
   * Resolved hour cycle. The public `DateInput` / `TimeInput` wrappers read
   * this from `DateFormatProvider` and pass it down — it isn't a public
   * prop on those components.
   */
  hourCycle?: 12 | 24;
}

/**
 * Anchor a bare time to today's year/month/day.
 *
 * - For DateTime inputs without an existing value, this gives a reasonable default.
 * - For TimeInputs we feed a CalendarDateTime to `TimeFieldState.setValue`;
 *   `useTimeFieldState` converts it back to a plain `Time` via `toTime()`.
 */
function anchorTimeToToday(timeValue: TimeValue): CalendarDateTime {
  const t = now(getLocalTimeZone());
  return new CalendarDateTime(t.year, t.month, t.day, timeValue.hour, timeValue.minute, 0);
}

export const DateInputInternal: FC<DateInputInternalProps> = ({
  state,
  icon: IconComponent,
  error,
  disabled,
  readOnly,
  placeholder,
  showTimeDropdown,
  timeStep,
  hourCycle,
  size,
  ref,
  ...props
}) => {
  const dropdownRef = useRef<TimeDropdownHandle>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const hasValue = state.segments.some(seg => seg.isEditable && !seg.isPlaceholder);
  const showPlaceholder = !!placeholder && !hasValue && !isFocused;

  const hasTimeSegments = state.segments.some(seg => seg.type === 'hour' || seg.type === 'minute');
  const hasDateSegments = state.segments.some(
    seg => seg.type === 'year' || seg.type === 'month' || seg.type === 'day',
  );

  const handleClear = () => {
    state.setValue(null);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showTimeDropdown && hasTimeSegments) {
      setIsDropdownOpen(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsDropdownOpen(false);
  };

  const handleTimeSelect = useCallback(
    (timeValue: TimeValue) => {
      if (hasDateSegments) {
        // DateFieldState carrying a CalendarDateTime / ZonedDateTime.
        const dateState = state as DateFieldState;
        const current = dateState.value;
        const next =
          current && 'hour' in current
            ? current.set({
                hour: timeValue.hour,
                minute: timeValue.minute,
                second: 0,
                millisecond: 0,
              })
            : anchorTimeToToday(timeValue);
        dateState.setValue(next);
        return;
      }
      // Time-only: TimeFieldState.setValue accepts TimeValue — CalendarDateTime satisfies it.
      const timeState = state as TimeFieldState;
      timeState.setValue(anchorTimeToToday(timeValue));
    },
    [state, hasDateSegments],
  );

  const handleKeyDownCapture = useTimeDropdownKeyCapture({
    enabled: Boolean(showTimeDropdown),
    isOpen: isDropdownOpen,
    dropdownRef,
    onOpen: () => setIsDropdownOpen(true),
  });

  const currentTimeValue: TimeValue | null =
    state.value !== null && hasTimeSegments ? (state.value as TimeValue) : null;

  return (
    <InputGroup size={size}>
      {IconComponent && (
        <InputGroupAddon>
          <IconComponent />
        </InputGroupAddon>
      )}

      <div
        className={cn('relative flex-1 h-full', !IconComponent && 'pl-12')}
        onKeyDownCapture={handleKeyDownCapture}
      >
        {showPlaceholder && placeholder && (
          <TemporalPlaceholder text={placeholder} className={cn(!IconComponent && 'pl-12')} />
        )}
        <TemporalSegmentGroup
          {...props}
          ref={ref}
          data-slot='input'
          className={cn('h-full', showPlaceholder && 'opacity-0')}
          aria-invalid={error || undefined}
          aria-disabled={disabled || undefined}
          state={state}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={handleFocus}
          onBlur={handleBlur}
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

      {hasValue && (
        <InputGroupAddon align='inline-end'>
          <TemporalClear onClick={handleClear} disabled={disabled} />
        </InputGroupAddon>
      )}
    </InputGroup>
  );
};

DateInputInternal.displayName = 'DateInputInternal';
