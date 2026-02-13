import { type FC, useState } from 'react';
import { InputGroupAddon } from '../InputGroup';
import { TemporalClear } from '../TemporalCore';
import { useDateRangeContext } from './DateRangeContext';
import { DateRangeEndValue } from './DateRangeEndValue';
import { DateRangeSegment } from './DateRangeSegment';

export const DateRangeEnd: FC = () => {
  const context = useDateRangeContext();
  const [key, setKey] = useState<number>(0);

  const handleClear = () => {
    if (!context?.state) return;
    context.state.setDateTime('end', null);
    setKey(key => key + 1);
  };

  return (
    <DateRangeSegment>
      <DateRangeEndValue key={key} />

      <InputGroupAddon align='inline-end'>
        <TemporalClear onClick={handleClear} disabled={!context || context.disabled} />
      </InputGroupAddon>
    </DateRangeSegment>
  );
};

DateRangeEnd.displayName = 'DateRangeEnd';
