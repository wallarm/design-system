import { type FC, useCallback, useState } from 'react';
import { cn } from '../../utils/cn';
import { InputGroup, InputGroupAddon } from '../InputGroup';
import { TemporalClear } from '../TemporalCore';
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
  const [clearKey, setClearKey] = useState(0);

  const hasAnyValue = startHasValue || endHasValue;

  const handleClear = useCallback(() => {
    if (!context?.state) return;
    context.state.setValue(null);
    setClearKey(k => k + 1);
  }, [context]);

  if (!context) return null;

  const { startFieldProps, startRef, endFieldProps, endRef, disabled } = context;

  return (
    <div className={cn('**:data-[slot=input]:first:pr-0 **:data-[slot=input]:last:pl-0 min-w-284')}>
      <InputGroup>
        {IconComponent && (
          <InputGroupAddon>
            <IconComponent />
          </InputGroupAddon>
        )}

        <DateRangeGroup>
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
