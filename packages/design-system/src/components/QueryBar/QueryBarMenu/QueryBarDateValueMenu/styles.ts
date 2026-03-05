import { cn } from '../../../../utils/cn';

/** Shared cell trigger styles for month/year views */
export const cellTriggerClass = 'w-full h-[36px] text-sm rounded-8 cursor-pointer hover:bg-states-brand-hover data-[selected]:bg-bg-fill-brand data-[selected]:text-text-primary-alt data-[selected]:font-medium';

/** Day cell trigger styles with today indicator, range highlights */
export const dayCellTriggerClass = cn(
  'relative flex items-center justify-center w-full h-[36px] font-mono text-sm rounded-8 cursor-pointer',
  'hover:bg-states-brand-hover',
  'data-[selected]:bg-bg-fill-brand data-[selected]:text-text-primary-alt data-[selected]:font-medium',
  'data-[outside-range]:text-text-secondary data-[outside-range]:cursor-default data-[outside-range]:hover:bg-transparent',
  "data-[today]:after:content-[''] data-[today]:after:absolute data-[today]:after:bottom-[2px] data-[today]:after:left-1/2 data-[today]:after:-translate-x-1/2 data-[today]:after:size-[4px] data-[today]:after:rounded-full data-[today]:after:bg-bg-fill-brand",
  'data-[selected]:data-[today]:after:bg-text-primary-alt',
  // Range: highlight days between start and end
  'data-[in-range]:bg-states-brand-hover data-[in-range]:rounded-none',
  'data-[range-start]:rounded-l-8 data-[range-end]:rounded-r-8',
);
