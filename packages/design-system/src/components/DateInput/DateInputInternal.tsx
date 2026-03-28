import { forwardRef, useCallback, useRef, useState } from "react";
import {
  CalendarDateTime,
  getLocalTimeZone,
  now,
} from "@internationalized/date";
import type { TimeValue } from "@react-aria/datepicker";
import type { DateFieldState, TimeFieldState } from "@react-stately/datepicker";
import type { GroupDOMAttributes } from "@react-types/shared";
import { cn } from "../../utils/cn";
import { InputGroup, InputGroupAddon } from "../InputGroup";
import {
  TemporalClear,
  TemporalPlaceholder,
  TemporalSegmentGroup,
  TimeDropdown,
  type TimeDropdownHandle,
  useTimeDropdownKeyCapture,
} from "../TemporalCore";
import type { DateInputBaseProps, DateInputSize } from "./types";

const sizeClasses: Record<DateInputSize, string> = {
  default: "h-36",
  medium: "h-32",
  small: "h-24",
};

export interface DateInputInternalProps
  extends GroupDOMAttributes, DateInputBaseProps {
  state: DateFieldState | TimeFieldState;
}

export const DateInputInternal = forwardRef<
  HTMLDivElement,
  DateInputInternalProps
>(
  (
    {
      state,
      size = "default",
      icon: IconComponent,
      error,
      disabled,
      placeholder,
      showTimeDropdown,
      timeStep = 30,
      hourCycle,
      ...props
    },
    ref,
  ) => {
    const dropdownRef = useRef<TimeDropdownHandle>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const hasValue = state.segments.some(
      (seg) => seg.isEditable && !seg.isPlaceholder,
    );
    const showPlaceholder = placeholder && !hasValue && !isFocused;

    // Check if input has time segments and date segments
    const hasTimeSegments = state.segments.some(
      (seg) => seg.type === "hour" || seg.type === "minute",
    );
    const hasDateSegments = state.segments.some(
      (seg) =>
        seg.type === "year" || seg.type === "month" || seg.type === "day",
    );

    const handleClear = () => {
      state.setValue(null);
    };

    const handleFocus = () => {
      setIsFocused(true);
      // Show dropdown when has time segments and showTimeDropdown is enabled
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
        if (state.value) {
          // state.value exists, update its hour and minute
          const newValue = state.value.set({
            hour: timeValue.hour,
            minute: timeValue.minute,
            second: 0,
            millisecond: 0,
          });
          state.setValue(newValue as any);
        } else if (hasDateSegments) {
          // DateTimeInput: create a CalendarDateTime with today's date and selected time
          const today = now(getLocalTimeZone());
          const newValue = new CalendarDateTime(
            today.year,
            today.month,
            today.day,
            timeValue.hour,
            timeValue.minute,
            0,
          );
          state.setValue(newValue as any);
        } else {
          // TimeInput: wrap in CalendarDateTime because the underlying DateFieldState
          // expects a CalendarDateTime, not a raw Time. useTimeFieldState's onChange
          // will convert it back to Time via toTime().
          const todayDate = now(getLocalTimeZone());
          const newValue = new CalendarDateTime(
            todayDate.year,
            todayDate.month,
            todayDate.day,
            timeValue.hour,
            timeValue.minute,
            0,
          );
          state.setValue(newValue as any);
        }
      },
      [state, hasDateSegments],
    );

    const handleKeyDownCapture = useTimeDropdownKeyCapture({
      enabled: Boolean(showTimeDropdown),
      isOpen: isDropdownOpen,
      dropdownRef,
      onOpen: () => setIsDropdownOpen(true),
    });

    // Extract time value from current state
    // For TimeInput, state.value is already a TimeValue, don't reconstruct it
    const currentTimeValue: TimeValue | null =
      state.value && hasTimeSegments ? (state.value as TimeValue) : null;

    return (
      <InputGroup className={sizeClasses[size]}>
        {IconComponent && (
          <InputGroupAddon>
            <IconComponent />
          </InputGroupAddon>
        )}

        <div
          className={cn("relative flex-1", !IconComponent && "pl-12")}
          onKeyDownCapture={handleKeyDownCapture}
        >
          {showPlaceholder && <TemporalPlaceholder text={placeholder} />}
          <TemporalSegmentGroup
            {...props}
            ref={ref}
            data-slot="input"
            className={cn(sizeClasses[size], showPlaceholder && "opacity-0")}
            aria-invalid={error || undefined}
            aria-disabled={disabled || undefined}
            state={state}
            disabled={disabled}
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
          <InputGroupAddon align="inline-end">
            <TemporalClear onClick={handleClear} disabled={disabled} />
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  },
);
