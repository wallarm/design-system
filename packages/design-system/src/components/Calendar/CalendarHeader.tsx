import type { FC } from 'react';
import { DatePicker } from '@ark-ui/react';
import { getLocalTimeZone, today } from '@internationalized/date';
import { ArrowLeft } from '../../icons/ArrowLeft';
import { ArrowRight } from '../../icons/ArrowRight';
import { CornerUpLeft } from '../../icons/CornerUpLeft';
import { CornerUpRight } from '../../icons/CornerUpRight';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Separator } from '../Separator';
import { Tooltip } from '../Tooltip';
import { TooltipContent } from '../Tooltip/TooltipContent';
import { TooltipTrigger } from '../Tooltip/TooltipTrigger';
import { useCalendarContext } from './CalendarContext';
import type { DateValue } from './types';

interface VisibleRangeText {
  start: string;
  end: string;
}

interface CalendarHeaderProps {
  /** Whether to show navigation arrows */
  showArrows?: boolean;
  /** Whether to show the jump to today button */
  showJumpToToday?: boolean;
  /** Override visible range text (for offset months in range picker) */
  visibleRangeText?: VisibleRangeText;
}

/**
 * Month header with title and navigation controls.
 * Shows month/year and optional jump to today and prev/next arrows.
 * Automatically adapts to single/double calendar mode from context.
 */
export const CalendarHeader: FC<CalendarHeaderProps> = ({
  showArrows = true,
  showJumpToToday = false,
  visibleRangeText: visibleRangeTextProp,
}) => {
  const { isRange, readonly } = useCalendarContext();

  // In readonly mode, hide navigation controls
  const effectiveShowArrows = showArrows && !readonly;
  const effectiveShowJumpToToday = showJumpToToday && !readonly;

  return (
    <DatePicker.ViewControl className={cn('flex items-center justify-between w-280 h-36')}>
      <DatePicker.Context>
        {api => {
          const text = visibleRangeTextProp?.start ?? api.visibleRangeText.start;
          const parts = text.split(' ');
          const month = parts[0];
          const year = parts[1];

          // Check if today's month is currently visible
          const todayDate = today(getLocalTimeZone());
          const visibleRange = api.visibleRange;

          // In single mode: check if today is in the visible month
          // In double mode: check if today is within either visible month (left or right)
          const isTodayMonthVisible = isRange
            ? // Double calendar shows current month and next month
              (todayDate.year === visibleRange.start.year &&
                todayDate.month === visibleRange.start.month) ||
              (todayDate.year === visibleRange.end.year &&
                todayDate.month === visibleRange.end.month)
            : // Single calendar shows just one month
              todayDate.year === visibleRange.start.year &&
              todayDate.month === visibleRange.start.month;

          const shouldShowJumpToToday = effectiveShowJumpToToday && !isTodayMonthVisible;

          // Determine if we're viewing past or future relative to today
          // Compare year first, then month
          const isViewingFuture =
            visibleRange.start.year > todayDate.year ||
            (visibleRange.start.year === todayDate.year &&
              visibleRange.start.month > todayDate.month);

          // Use CornerUpLeft (pointing back) when viewing future, CornerUpRight (pointing forward) when viewing past
          const JumpToTodayIcon = isViewingFuture ? CornerUpLeft : CornerUpRight;

          return (
            <>
              <div className={cn('flex items-center gap-4 pl-8', 'font-sans text-sm leading-sm')}>
                <span className='font-medium text-text-primary'>{month}</span>
                <span className='font-normal text-text-secondary'>{year}</span>
              </div>

              {(effectiveShowArrows || shouldShowJumpToToday) && (
                <div className='flex items-center gap-4 pr-8'>
                  {shouldShowJumpToToday && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            color='neutral'
                            size='small'
                            aria-label='Jump to today'
                            onClick={() => {
                              api.setFocusedValue(todayDate as unknown as DateValue);
                            }}
                          >
                            <JumpToTodayIcon size='sm' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Jump to today</TooltipContent>
                      </Tooltip>
                      {effectiveShowArrows && (
                        <div className='h-16 flex items-center'>
                          <Separator orientation='vertical' />
                        </div>
                      )}
                    </>
                  )}
                  {effectiveShowArrows && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DatePicker.PrevTrigger asChild>
                            <Button
                              variant='ghost'
                              color='neutral'
                              size='small'
                              aria-label='Previous month'
                            >
                              <ArrowLeft size='sm' />
                            </Button>
                          </DatePicker.PrevTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Previous month</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DatePicker.NextTrigger asChild>
                            <Button
                              variant='ghost'
                              color='neutral'
                              size='small'
                              aria-label='Next month'
                            >
                              <ArrowRight size='sm' />
                            </Button>
                          </DatePicker.NextTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Next month</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              )}
            </>
          );
        }}
      </DatePicker.Context>
    </DatePicker.ViewControl>
  );
};

CalendarHeader.displayName = 'CalendarHeader';
