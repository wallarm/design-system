import type { FC } from 'react';
import { DatePicker } from '@ark-ui/react/date-picker';
import { CalendarNav } from './CalendarNav';
import { cellTriggerClass } from './styles';

export const MonthView: FC = () => (
  <DatePicker.View view='month'>
    <DatePicker.Context>
      {api => (
        <>
          <CalendarNav />
          <DatePicker.Table className='w-full border-collapse'>
            <DatePicker.TableBody>
              {api.getMonthsGrid({ columns: 4, format: 'short' }).map((months, i) => (
                <DatePicker.TableRow key={i} className='flex'>
                  {months.map((month, j) => (
                    <DatePicker.TableCell
                      key={j}
                      value={month.value}
                      className='flex-1 text-center p-0'
                    >
                      <DatePicker.TableCellTrigger className={cellTriggerClass}>
                        {month.label}
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
