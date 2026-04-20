import { type FC, type FocusEvent, useCallback, useState } from 'react';
import { cn } from '../../utils/cn';
import { InputGroup, InputGroupAddon } from '../InputGroup';
import { TemporalClear, TemporalPlaceholder } from '../TemporalCore';
import { useDateRangeContext } from './DateRangeContext';
import { DateRangeGroup } from './DateRangeGroup';
import { DateRangeSegmentGroup } from './DateRangeSegmentGroup';
import { DateRangeSeparator } from './DateRangeSeparator';
import type { DateRangeBaseProps } from './types';

export type DateRangeInputInternalProps = Pick<DateRangeBaseProps, 'icon'>;

export const DateRangeInputInternal: FC<DateRangeInputInternalProps> = ({
  icon: IconComponent,
}) => {
  const context = useDateRangeContext();
  const [startHasValue, setStartHasValue] = useState(false);
  const [endHasValue, setEndHasValue] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [clearKey, setClearKey] = useState(0);

  const hasAnyValue = startHasValue || endHasValue;

  const handleClear = useCallback(() => {
    if (!context?.state) return;
    context.state.setValue(null);
    setClearKey(k => k + 1);
  }, [context]);

  const handleFocusCapture = () => setIsFocused(true);

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  };

  if (!context) return null;

  const { startFieldProps, startRef, endFieldProps, endRef, disabled, placeholder, size } = context;

  const showPlaceholder = Boolean(placeholder && !hasAnyValue && !isFocused);

  return (
    <div
      className={cn('**:data-[slot=input]:first:pr-0 **:data-[slot=input]:last:pl-0 min-w-284')}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <InputGroup size={size}>
        {IconComponent && (
          <InputGroupAddon>
            <IconComponent />
          </InputGroupAddon>
        )}

        <DateRangeGroup className={cn(!IconComponent && 'pl-12')}>
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

        <InputGroupAddon align='inline-end'>
          <div className={cn(!hasAnyValue && 'invisible')}>
            <TemporalClear onClick={handleClear} disabled={disabled} />
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

DateRangeInputInternal.displayName = 'DateRangeInputInternal';
