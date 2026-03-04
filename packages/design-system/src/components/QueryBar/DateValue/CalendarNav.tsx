import { DatePicker } from '@ark-ui/react/date-picker';
import type { FC } from 'react';
import { ChevronLeft } from '../../../icons/ChevronLeft';
import { ChevronRight } from '../../../icons/ChevronRight';

export const CalendarNav: FC = () => (
  <DatePicker.ViewControl className='flex items-center justify-between mb-8'>
    <DatePicker.PrevTrigger className='p-4 rounded-8 hover:bg-states-brand-hover text-text-secondary'>
      <ChevronLeft />
    </DatePicker.PrevTrigger>
    <DatePicker.ViewTrigger className='text-sm font-medium text-text-primary'>
      <DatePicker.RangeText />
    </DatePicker.ViewTrigger>
    <DatePicker.NextTrigger className='p-4 rounded-8 hover:bg-states-brand-hover text-text-secondary'>
      <ChevronRight />
    </DatePicker.NextTrigger>
  </DatePicker.ViewControl>
);
