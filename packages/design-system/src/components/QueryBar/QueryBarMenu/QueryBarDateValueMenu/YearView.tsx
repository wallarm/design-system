import { DatePicker } from '@ark-ui/react/date-picker';
import type { FC } from 'react';
import { CalendarNav } from './CalendarNav';
import { cellTriggerClass } from './styles';

export const YearView: FC = () => (
  <DatePicker.View view='year'>
    <DatePicker.Context>
      {(api) => (
        <>
          <CalendarNav />
          <DatePicker.Table className='w-full border-collapse'>
            <DatePicker.TableBody>
              {api.getYearsGrid({ columns: 4 }).map((years, i) => (
                <DatePicker.TableRow key={i} className='flex'>
                  {years.map((year, j) => (
                    <DatePicker.TableCell key={j} value={year.value} className='flex-1 text-center p-0'>
                      <DatePicker.TableCellTrigger className={cellTriggerClass}>
                        {year.label}
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
