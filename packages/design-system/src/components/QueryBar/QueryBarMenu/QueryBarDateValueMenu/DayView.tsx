import type { FC } from 'react';
import { DatePicker } from '@ark-ui/react/date-picker';
import { CalendarNav } from './CalendarNav';
import { dayCellTriggerClass } from './styles';

export const DayView: FC = () => (
  <DatePicker.View view='day'>
    <DatePicker.Context>
      {api => (
        <>
          <CalendarNav />
          <DatePicker.Table className='w-full border-collapse'>
            <DatePicker.TableHead>
              <DatePicker.TableRow className='flex'>
                {api.weekDays.map((weekDay, i) => (
                  <DatePicker.TableHeader
                    key={i}
                    className='flex-1 font-mono text-xs font-medium text-text-secondary text-center py-4'
                  >
                    {weekDay.narrow}
                  </DatePicker.TableHeader>
                ))}
              </DatePicker.TableRow>
            </DatePicker.TableHead>
            <DatePicker.TableBody>
              {api.weeks.map((week, i) => (
                <DatePicker.TableRow key={i} className='flex'>
                  {week.map((day, j) => (
                    <DatePicker.TableCell
                      key={j}
                      value={day}
                      className='flex-1 text-center p-[2px]'
                    >
                      <DatePicker.TableCellTrigger className={dayCellTriggerClass}>
                        {day.day}
                      </DatePicker.TableCellTrigger>
                    </DatePicker.TableCell>
                  ))}
                </DatePicker.TableRow>
              ))}
            </DatePicker.TableBody>
          </DatePicker.Table>
        </>
      )}
    </DatePicker.Context>
  </DatePicker.View>
);
