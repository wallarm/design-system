import { type FC, type FocusEvent, useCallback, useState } from 'react';
import { cn } from '../../utils/cn';
import { InputGroup, InputGroupAddon } from '../InputGroup';
import { TemporalClear, TemporalPlaceholder } from '../TemporalCore';
import { useDateRangeContext } from './DateRangeContext';
import { DateRangeGroup } from './DateRangeGroup';
import { DateRangeSegmentGroup } from './DateRangeSegmentGroup';
import { DateRangeSeparator } from './DateRangeSeparator';

/**
 * Default integrated rendering of a date range: one shared `InputGroup` with
 * the calendar icon, start segment group, separator, end segment group, and
 * the clear affordance pinned to the right.
 *
 * Relies on `DateRangeProvider` for state — it is rendered inside one by
 * `DateRangeInput`, and `useDateRangeContext` will throw if called directly.
 */
export const DateRangeInputInternal: FC = () => {
  const {
    icon: IconComponent,
    state,
    startFieldProps,
    startRef,
    endFieldProps,
    endRef,
    disabled,
    readOnly,
    placeholder,
    size,
  } = useDateRangeContext();

  const [startHasValue, setStartHasValue] = useState(false);
  const [endHasValue, setEndHasValue] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [clearKey, setClearKey] = useState(0);

  const hasAnyValue = startHasValue || endHasValue;

  const handleClear = useCallback(() => {
    state.setValue(null);
    setClearKey(k => k + 1);
  }, [state]);

  const handleFocusCapture = () => setIsFocused(true);

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  };

  const showPlaceholder = Boolean(placeholder) && !hasAnyValue && !isFocused;

  return (
    <div
      className={cn('**:data-[slot=input]:first:pr-0 **:data-[slot=input]:last:pl-0')}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <InputGroup size={size}>
        {IconComponent && (
          <InputGroupAddon>
            <IconComponent />
          </InputGroupAddon>
        )}

        <DateRangeGroup>
          {showPlaceholder && placeholder && (
            <TemporalPlaceholder text={placeholder} className={cn(!IconComponent && 'pl-12')} />
          )}
          <div className={cn('contents', showPlaceholder && '[&>*]:opacity-0')}>
            <DateRangeSegmentGroup
              key={`start-${clearKey}`}
              {...startFieldProps}
              ref={startRef}
              type='start'
              onHasPartialValueChange={setStartHasValue}
            />

            <DateRangeSeparator />

            <DateRangeSegmentGroup
              key={`end-${clearKey}`}
              {...endFieldProps}
              ref={endRef}
              type='end'
              onHasPartialValueChange={setEndHasValue}
            />
          </div>
        </DateRangeGroup>

        {!readOnly && (
          <InputGroupAddon align='inline-end'>
            <div className={cn(!hasAnyValue && 'invisible')}>
              {/* When the button is invisible we also disable it — this removes it
                  from tab order and from the accessibility tree so users don't
                  Tab into a no-op control. */}
              <TemporalClear onClick={handleClear} disabled={disabled || !hasAnyValue} />
            </div>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  );
};

DateRangeInputInternal.displayName = 'DateRangeInputInternal';
