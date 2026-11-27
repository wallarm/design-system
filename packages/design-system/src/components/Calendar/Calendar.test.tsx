import { useState } from 'react';
import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Button } from '../Button';
import { Calendar } from './Calendar';
import { CalendarApplyButton } from './CalendarApplyButton';
import { CalendarBody } from './CalendarBody';
import { CalendarContent } from './CalendarContent';
import { CalendarFooter } from './CalendarFooter';
import { CalendarFooterControls } from './CalendarFooterControls';
import { CalendarGrids } from './CalendarGrids';
import { CalendarInputHeader } from './CalendarInputHeader';
import { CalendarPresetItem } from './CalendarPresetItem';
import { CalendarPresets } from './CalendarPresets';
import { CalendarResetButton } from './CalendarResetButton';
import { CalendarTrigger } from './CalendarTrigger';
import type { CalendarType, DateValue } from './types';

// Calendar is a compound API; analytics seams live on the exported
// sub-components. Day cells are rendered dynamically inside `CalendarGrid`
// (28-42 cells per month) and are NOT individually addressable — see
// docs/metrics/contract.md for the documented gap and the
// "derive from onChange payload" workaround.

const renderCalendar = (extras?: { onApplyClick?: () => void; onResetClick?: () => void }) =>
  render(
    <Calendar type='single' defaultOpen closeOnSelect={false}>
      <CalendarTrigger>
        <Button data-testid='trigger' data-analytics-id='OPEN_CALENDAR'>
          Open
        </Button>
      </CalendarTrigger>
      <CalendarContent>
        <CalendarPresets>
          <CalendarPresetItem
            label='Today'
            value='last3Days'
            shortcut='T'
            data-testid='preset-today'
            data-analytics-id='PRESET_TODAY'
          />
          <CalendarPresetItem
            label='This month'
            value='lastMonth'
            shortcut='M'
            data-testid='preset-month'
            data-analytics-id='PRESET_MONTH'
            data-analytics-props='{"range":"month"}'
          />
        </CalendarPresets>
        <CalendarBody>
          <CalendarGrids />
          <CalendarFooter>
            <CalendarFooterControls>
              <CalendarResetButton
                data-testid='reset'
                data-analytics-id='CALENDAR_RESET'
                onClick={extras?.onResetClick}
              />
              <CalendarApplyButton
                data-testid='apply'
                data-analytics-id='CALENDAR_APPLY'
                onClick={extras?.onApplyClick}
              />
            </CalendarFooterControls>
          </CalendarFooter>
        </CalendarBody>
      </CalendarContent>
    </Calendar>,
  );

const clickDay = async (label: string) => {
  const cell = [...document.querySelectorAll('[data-part="table-cell-trigger"]')].find(
    c => c.textContent?.trim() === label,
  );
  expect(cell).toBeTruthy();
  await userEvent.click(cell as Element);
};

describe('Attribute pass-through (compound seams)', () => {
  it('forwards data-analytics-id to the CalendarTrigger via asChild slot merge', () => {
    renderCalendar();
    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_CALENDAR');
  });

  it('forwards data-analytics-id to CalendarApplyButton <button>', () => {
    renderCalendar();
    const apply = screen.getByTestId('apply');
    expect(apply.tagName).toBe('BUTTON');
    expect(apply).toHaveAttribute('data-analytics-id', 'CALENDAR_APPLY');
  });

  it('forwards data-analytics-id to CalendarResetButton <button>', () => {
    renderCalendar();
    const reset = screen.getByTestId('reset');
    expect(reset.tagName).toBe('BUTTON');
    expect(reset).toHaveAttribute('data-analytics-id', 'CALENDAR_RESET');
  });

  it('forwards data-analytics-id to each CalendarPresetItem <button>', () => {
    renderCalendar();
    const today = screen.getByTestId('preset-today');
    const month = screen.getByTestId('preset-month');
    expect(today.tagName).toBe('BUTTON');
    expect(today).toHaveAttribute('data-analytics-id', 'PRESET_TODAY');
    expect(month).toHaveAttribute('data-analytics-id', 'PRESET_MONTH');
  });

  it('forwards data-analytics-props verbatim on a CalendarPresetItem', () => {
    renderCalendar();
    expect(screen.getByTestId('preset-month')).toHaveAttribute(
      'data-analytics-props',
      '{"range":"month"}',
    );
  });
});

describe('Click resolution', () => {
  it('resolves clicks on CalendarPresetItem to its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    renderCalendar();
    await userEvent.click(screen.getByTestId('preset-today'));
    expect(captured).toHaveBeenCalledWith('PRESET_TODAY');
  });

  it('resolves clicks on CalendarApplyButton to its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    renderCalendar();
    await userEvent.click(screen.getByTestId('apply'));
    expect(captured).toHaveBeenCalledWith('CALENDAR_APPLY');
  });
});

describe('Handler composition', () => {
  it('preserves consumer onClick on CalendarPresetItem (runs after preset selection)', async () => {
    const onClick = rs.fn();
    render(
      <Calendar type='range' defaultOpen closeOnSelect={false}>
        <CalendarTrigger>
          <Button>Open</Button>
        </CalendarTrigger>
        <CalendarContent>
          <CalendarPresets>
            <CalendarPresetItem
              label='Last week'
              value='lastWeek'
              data-testid='preset'
              onClick={onClick}
            />
          </CalendarPresets>
          <CalendarBody>
            <CalendarGrids />
          </CalendarBody>
        </CalendarContent>
      </Calendar>,
    );
    await userEvent.click(screen.getByTestId('preset'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('preserves consumer onClick on CalendarApplyButton', async () => {
    const onApplyClick = rs.fn();
    renderCalendar({ onApplyClick });
    await userEvent.click(screen.getByTestId('apply'));
    expect(onApplyClick).toHaveBeenCalledTimes(1);
  });
});

describe('Day-cell gap (documented)', () => {
  it('does not expose per-day-cell analytics ids; day cells are dynamic and unreachable', () => {
    renderCalendar();
    // Day cells are rendered by Ark UI's `DatePicker.TableCellTrigger` inside
    // `CalendarGrid`. None of them carry consumer-supplied analytics ids —
    // there is no public per-cell seam by design. Per-day-pick analytics is
    // derived from the `onChange` payload at the consumer level.
    const dayCells = document.querySelectorAll(
      '[role="gridcell"], [data-part="table-cell-trigger"]',
    );
    expect(dayCells.length).toBeGreaterThan(0);
    for (const cell of dayCells) {
      expect(cell).not.toHaveAttribute('data-analytics-id');
    }
  });
});

describe('showTime promotion', () => {
  const renderWithTime = (onChange: (value: DateValue[]) => void) =>
    render(
      <Calendar
        type='single'
        showTime
        defaultOpen
        closeOnSelect={false}
        value={[new CalendarDateTime(2026, 6, 15, 14, 30) as unknown as DateValue]}
        onChange={onChange}
      >
        <CalendarTrigger>
          <Button>Open</Button>
        </CalendarTrigger>
        <CalendarContent>
          <CalendarBody>
            <CalendarInputHeader />
            <CalendarGrids />
          </CalendarBody>
        </CalendarContent>
      </Calendar>,
    );

  it('emits a CalendarDateTime carrying the tracked time when a grid day is picked', async () => {
    const onChange = rs.fn();
    renderWithTime(onChange);

    // The grid produces a date-only value; Calendar promotes it to a
    // CalendarDateTime using the time from the current value (14:30).
    await clickDay('20');

    expect(onChange).toHaveBeenCalled();
    const emitted = onChange.mock.calls.at(-1)?.[0]?.[0];
    expect(emitted).toBeTruthy();
    expect('hour' in emitted).toBe(true);
    expect(emitted.day).toBe(20);
    expect(emitted.hour).toBe(14);
    expect(emitted.minute).toBe(30);
  });

  // The header time-only commit path (editing the time segments) is covered by
  // the Attribute date-time e2e.
});

// react-stately hands every year keystroke to onChange as a whole date
// (2 → 0002-08-11, 20 → 0020-08-11, …). Ark clamps such a date to minDate and
// Calendar drops a range whose end precedes its start, so committing it wiped
// what the reader had typed (WDS-165).
describe('Input header typing', () => {
  const date = (year: number, month: number, day: number) =>
    new CalendarDate(year, month, day) as unknown as DateValue;

  const ControlledCalendar = ({
    type,
    showTime,
    minDate,
    initialValue = [],
    onChange,
  }: {
    type: CalendarType;
    showTime?: boolean;
    minDate?: DateValue;
    initialValue?: DateValue[];
    onChange: (value: DateValue[]) => void;
  }) => {
    const [value, setValue] = useState(initialValue);

    const handleChange = (next: DateValue[]) => {
      setValue(next);
      onChange(next);
    };

    return (
      <Calendar
        type={type}
        showTime={showTime}
        minDate={minDate}
        value={value}
        onChange={handleChange}
        defaultOpen
        closeOnSelect={false}
      >
        <CalendarTrigger>
          <Button>Open</Button>
        </CalendarTrigger>
        <CalendarContent>
          <CalendarBody>
            <CalendarInputHeader />
            <CalendarGrids />
          </CalendarBody>
        </CalendarContent>
      </Calendar>
    );
  };

  /** A header segment; `field` 0 is the start (or only) input, 1 the range end. */
  const segment = (name: 'day' | 'month' | 'year', field = 0) =>
    screen.getAllByRole('spinbutton', { name })[field] as HTMLElement;

  const fieldText = (field = 0) =>
    (['day', 'month', 'year'] as const).map(name => segment(name, field).textContent).join(' ');

  /** Types `year` digit by digit, checking the field keeps `dayMonth` after each one. */
  const typeYear = async (year: string, dayMonth: string, field = 0) => {
    for (let length = 1; length <= year.length; length++) {
      await userEvent.keyboard(year[length - 1] as string);
      expect(fieldText(field)).toBe(`${dayMonth} ${year.slice(0, length)}`);
    }
  };

  const emitted = (onChange: { mock: { calls: [DateValue[]][] } }) =>
    onChange.mock.calls.map(([value]) => value.map(String));

  it('keeps the range end while its year is typed', async () => {
    const onChange = rs.fn<(value: DateValue[]) => void>();
    render(
      <ControlledCalendar type='range' initialValue={[date(2026, 8, 10)]} onChange={onChange} />,
    );

    await userEvent.click(segment('day', 1));
    await userEvent.keyboard('118'); // 11 Aug — focus moves on to the year
    await typeYear('2026', '11 Aug', 1);

    expect(emitted(onChange)).toEqual([['2026-08-10', '2026-08-11']]);
  });

  it('keeps the range start while its year is typed', async () => {
    const onChange = rs.fn<(value: DateValue[]) => void>();
    render(<ControlledCalendar type='range' minDate={date(2026, 1, 1)} onChange={onChange} />);

    await userEvent.click(segment('day'));
    await userEvent.keyboard('153');
    await typeYear('2026', '15 Mar');

    expect(emitted(onChange)).toEqual([['2026-03-15']]);
  });

  it('keeps a single date while its year is typed', async () => {
    const onChange = rs.fn<(value: DateValue[]) => void>();
    render(<ControlledCalendar type='single' minDate={date(2026, 1, 1)} onChange={onChange} />);

    await userEvent.click(segment('day'));
    await userEvent.keyboard('153');
    await typeYear('2026', '15 Mar');

    expect(emitted(onChange)).toEqual([['2026-03-15']]);
  });

  it('keeps a date and time while the year is typed', async () => {
    const onChange = rs.fn<(value: DateValue[]) => void>();
    render(
      <ControlledCalendar
        type='single'
        showTime
        minDate={date(2026, 1, 1)}
        initialValue={[new CalendarDateTime(2026, 6, 15, 14, 30) as unknown as DateValue]}
        onChange={onChange}
      />,
    );

    await userEvent.click(segment('year'));
    await typeYear('2027', '15 Jun');

    expect(emitted(onChange)).toEqual([['2027-06-15T14:30:00']]);
  });

  it('lets a grid pick replace a half-typed year', async () => {
    const onChange = rs.fn<(value: DateValue[]) => void>();
    render(
      <ControlledCalendar type='single' initialValue={[date(2026, 6, 15)]} onChange={onChange} />,
    );

    await userEvent.click(segment('year'));
    await userEvent.keyboard('2');
    expect(fieldText()).toBe('15 Jun 2');

    await clickDay('20');

    expect(fieldText()).toBe('20 Jun 2026');
    expect(emitted(onChange)).toEqual([['2026-06-20']]);
  });
});
