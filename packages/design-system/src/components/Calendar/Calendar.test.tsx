import { CalendarDateTime } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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
import type { DateValue } from './types';

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
    const onClick = vi.fn();
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
    const onApplyClick = vi.fn();
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

  const clickDay = async (label: string) => {
    const cell = [...document.querySelectorAll('[data-part="table-cell-trigger"]')].find(
      c => c.textContent?.trim() === label,
    );
    expect(cell).toBeTruthy();
    await userEvent.click(cell as Element);
  };

  it('emits a CalendarDateTime carrying the tracked time when a grid day is picked', async () => {
    const onChange = vi.fn();
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
});
