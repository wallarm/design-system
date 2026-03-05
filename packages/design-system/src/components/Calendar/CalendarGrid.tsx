import type { FC } from 'react';
import { DatePicker } from '@ark-ui/react';
import { cn } from '../../utils/cn';
import { useCalendarContext } from './CalendarContext';
import { CalendarHeader } from './CalendarHeader';

interface CalendarGridProps {
  /** Whether to show navigation arrows in header */
  showArrows?: boolean;
  /** Whether to show the jump to today button in header */
  showJumpToToday?: boolean;
  /** Month offset for displaying different months in range picker (0 = current, 1 = next month) */
  monthOffset?: number;
}

/**
 * Month grid with day cells.
 * Displays weekday headers and day cells with selection states.
 * Automatically adapts to single/double calendar mode from context.
 */
export const CalendarGrid: FC<CalendarGridProps> = ({
  showArrows = true,
  showJumpToToday = false,
  monthOffset = 0,
}) => {
  const { isRange, readonly } = useCalendarContext();

  return (
    <DatePicker.Context>
      {api => {
        const offset = monthOffset > 0 ? api.getOffset({ months: monthOffset }) : null;
        const weeks = offset ? offset.weeks : api.weeks;
        const visibleRange = offset ? offset.visibleRange : api.visibleRange;
        const visibleRangeText = offset ? offset.visibleRangeText : api.visibleRangeText;

        // Get the target month for this grid (used for hiding dates in double mode)
        const targetMonth = visibleRange.start.month;

        return (
          <DatePicker.View view='day' className='flex flex-col gap-8'>
            <CalendarHeader
              showArrows={showArrows}
              showJumpToToday={showJumpToToday}
              visibleRangeText={visibleRangeText}
            />

            <DatePicker.Table className={cn('w-280 border-collapse focus:outline-none')}>
              <DatePicker.TableHead>
                <DatePicker.TableRow>
                  {api.weekDays.map(day => (
                    <DatePicker.TableHeader
                      key={day.short}
                      className={cn(
                        'w-40 h-24',
                        'font-mono font-medium text-xs leading-xs',
                        'text-text-secondary text-center',
                      )}
                    >
                      {day.short}
                    </DatePicker.TableHeader>
                  ))}
                </DatePicker.TableRow>
              </DatePicker.TableHead>

              <DatePicker.TableBody>
                {weeks.map((week, weekIndex) => (
                  <DatePicker.TableRow key={weekIndex}>
                    {week.map(day => {
                      const isToday =
                        day.day === new Date().getDate() &&
                        day.month === new Date().getMonth() + 1 &&
                        day.year === new Date().getFullYear();

                      // Check if day is outside this grid's target month
                      const isOutsideTargetMonth = day.month !== targetMonth;

                      // In double calendar mode:
                      // - Left card (monthOffset=0): hide trailing dates (next month) completely
                      // - Right card (monthOffset>0): hide leading dates (previous month) completely
                      if (isRange && isOutsideTargetMonth) {
                        // Determine if day is after or before target month
                        // by comparing with the first day of the target month
                        const targetYear = visibleRange.start.year;
                        const isAfterTargetMonth =
                          day.year > targetYear ||
                          (day.year === targetYear && day.month > targetMonth);
                        const isBeforeTargetMonth =
                          day.year < targetYear ||
                          (day.year === targetYear && day.month < targetMonth);

                        const shouldHide =
                          (monthOffset === 0 && isAfterTargetMonth) ||
                          (monthOffset > 0 && isBeforeTargetMonth);

                        if (shouldHide) {
                          return <td key={day.toString()} className='w-40 h-40' />;
                        }
                      }

                      // For outside dates (in single mode or visible outside dates in double mode),
                      // use TableCell for data-in-range styling but render as non-interactive
                      if (isOutsideTargetMonth) {
                        // Use the API to get the cell state including hover range
                        const cellState = api.getDayTableCellState({
                          value: day,
                          visibleRange,
                        });

                        return (
                          <DatePicker.TableCell
                            key={day.toString()}
                            value={day}
                            visibleRange={visibleRange}
                          >
                            <div
                              className={cn(
                                'flex items-center justify-center relative',
                                'w-40 h-40 p-2',
                              )}
                            >
                              <span
                                className={cn(
                                  'flex items-center justify-center',
                                  'w-36 h-36 rounded-8',
                                  'font-mono text-sm leading-sm',
                                  'text-text-secondary',
                                  (cellState.inRange || cellState.inHoveredRange) &&
                                    'bg-states-primary-pressed',
                                  cellState.selected && 'bg-bg-fill-brand text-text-primary-alt',
                                )}
                              >
                                {day.day}
                              </span>
                            </div>
                          </DatePicker.TableCell>
                        );
                      }

                      // In readonly mode, render non-interactive cell
                      if (readonly) {
                        const cellState = api.getDayTableCellState({
                          value: day,
                          visibleRange,
                        });

                        return (
                          <DatePicker.TableCell
                            key={day.toString()}
                            value={day}
                            visibleRange={visibleRange}
                          >
                            <div
                              className={cn(
                                'flex items-center justify-center relative',
                                'w-40 h-40 p-2',
                              )}
                            >
                              <span
                                className={cn(
                                  'flex items-center justify-center',
                                  'w-36 h-36 rounded-8',
                                  'font-mono text-sm leading-sm',
                                  'text-text-primary',
                                  (cellState.inRange || cellState.inHoveredRange) &&
                                    'bg-states-primary-pressed',
                                  cellState.selected && 'bg-bg-fill-brand text-text-primary-alt',
                                )}
                              >
                                {day.day}
                              </span>
                              {isToday && (
                                <span
                                  className={cn(
                                    'absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full',
                                    'bg-bg-fill-brand',
                                    cellState.selected && 'bg-text-primary-alt',
                                  )}
                                />
                              )}
                            </div>
                          </DatePicker.TableCell>
                        );
                      }

                      return (
                        <DatePicker.TableCell
                          key={day.toString()}
                          value={day}
                          visibleRange={visibleRange}
                        >
                          <DatePicker.TableCellTrigger
                            className={cn(
                              'flex items-center justify-center relative',
                              'w-40 h-40 p-2',
                              'cursor-pointer select-none',
                              'outline-none',
                            )}
                          >
                            <span
                              className={cn(
                                'flex items-center justify-center',
                                'w-36 h-36 rounded-8',
                                'font-mono text-sm leading-sm',
                                'transition-colors',
                                '[[data-selected]_&]:bg-bg-fill-brand [[data-selected]_&]:text-text-primary-alt',
                                '[[data-in-range]_&]:bg-states-primary-pressed',
                                '[[data-outside-range]_&]:text-text-secondary',
                                '[[data-disabled]_&]:cursor-not-allowed [[data-disabled]_&]:line-through [[data-disabled]_&]:text-text-secondary',
                                'not-[[data-selected]_&]:not-[[data-disabled]_&]:hover:bg-states-primary-hover',
                                'not-[[data-selected]_&]:not-[[data-disabled]_&]:active:bg-states-primary-pressed',
                                // Focus ring on the background element (matches Figma)
                                // Use :focus-visible on parent to only show on keyboard navigation
                                '[:focus-visible_&]:ring-3 [:focus-visible_&]:ring-focus-primary',
                                '[[data-selected]:focus-visible_&]:ring-focus-brand',
                              )}
                            >
                              {day.day}
                            </span>
                            {isToday && (
                              <span
                                className={cn(
                                  'absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full',
                                  'bg-bg-fill-brand',
                                  '[[data-selected]_&]:bg-text-primary-alt',
                                )}
                              />
                            )}
                          </DatePicker.TableCellTrigger>
                        </DatePicker.TableCell>
                      );
                    })}
                  </DatePicker.TableRow>
                ))}
              </DatePicker.TableBody>
            </DatePicker.Table>
          </DatePicker.View>
        );
      }}
    </DatePicker.Context>
  );
};

CalendarGrid.displayName = 'CalendarGrid';
