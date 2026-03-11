import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { useCalendarContext } from './CalendarContext';
import { CalendarGrid } from './CalendarGrid';

export interface CalendarGridsProps {
  /** Additional className for styling */
  className?: string;
}

/**
 * Automatic calendar grids container.
 * Renders one or two grids based on calendar type from context.
 * Handles all layout and spacing automatically.
 */
export const CalendarGrids = forwardRef<HTMLDivElement, CalendarGridsProps>(
  ({ className }, ref) => {
    const { isRange, showInput } = useCalendarContext();

    return (
      <div
        ref={ref}
        className={cn('flex px-12 pb-12', !showInput && 'pt-12', isRange && 'gap-12', className)}
      >
        <CalendarGrid showArrows={!isRange} showJumpToToday={!isRange} />
        {isRange && <CalendarGrid showArrows showJumpToToday monthOffset={1} />}
      </div>
    );
  },
);

CalendarGrids.displayName = 'CalendarGrids';
