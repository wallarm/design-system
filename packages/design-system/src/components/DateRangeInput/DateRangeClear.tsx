import type { FC } from 'react';
import { TemporalClear } from '../TemporalCore';
import { useDateRangeContext } from './DateRangeContext';

export const DateRangeClear: FC = () => {
  const context = useDateRangeContext();

  const handleClick = () => {
    if (!context?.state) return;
    context.state.setValue(null);
  };

  return <TemporalClear onClick={handleClick} disabled={!context || context.disabled} />;
};

DateRangeClear.displayName = 'DateRangeClear';
