import { type FC, useState } from 'react';
import { InputGroupAddon } from '../InputGroup';
import { TemporalClear } from '../TemporalCore';
import { useDateRangeContext } from './DateRangeContext';
import { DateRangeSegment } from './DateRangeSegment';
import { DateRangeStartValue } from './DateRangeStartValue';

export const DateRangeStart: FC = () => {
  const context = useDateRangeContext();
  const [key, setKey] = useState<number>(0);

  const handleClear = () => {
    if (!context?.state) return;
    context.state.setDateTime('start', null);
    setKey(key => key + 1);
  };

  return (
    <DateRangeSegment>
      <DateRangeStartValue key={key} />

      <InputGroupAddon align='inline-end'>
        <TemporalClear onClick={handleClear} disabled={!context || context.disabled} />
      </InputGroupAddon>
    </DateRangeSegment>
  );
};

DateRangeStart.displayName = 'DateRangeStart';
