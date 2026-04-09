import type { FC } from 'react';

export const ChartBarListTooltip: FC = () => (
  <div className='rounded-8 border-1 border-border-primary-light bg-bg-surface-2 px-8 py-4 shadow-sm'>
    <span className='whitespace-nowrap font-sans text-xs font-medium text-text-primary'>
      Click to filter
    </span>
  </div>
);

ChartBarListTooltip.displayName = 'ChartBarListTooltip';
