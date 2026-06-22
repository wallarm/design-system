import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CalendarDate } from '../../index';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { DateRangeProvider } from './DateRangeContext';
import { DateRangeEndValue } from './DateRangeEndValue';
import { DateRangeInput } from './DateRangeInput';
import { DateRangeSeparator } from './DateRangeSeparator';
import { DateRangeStartValue } from './DateRangeStartValue';

// DateRangeInput is wrapper-level by default; the compound API
// (`DateRangeProvider` + `DateRangeStartValue` / `DateRangeEndValue`)
// also accepts arbitrary HTML attributes, giving consumers a per-field
// analytics seam. See docs/metrics/contract.md.

describe('Attribute pass-through (wrapper-level default)', () => {
  it('forwards data-analytics-id to the wrapper <div>', () => {
    render(<DateRangeInput data-testid='date-range' data-analytics-id='RANGE_FILTER' />);

    const root = screen.getByTestId('date-range');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('data-analytics-id', 'RANGE_FILTER');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'filter', field: 'created_at' });

    render(
      <DateRangeInput
        data-testid='date-range'
        data-analytics-id='RANGE_FILTER'
        data-analytics-props={payload}
      />,
    );

    const root = screen.getByTestId('date-range');
    expect(root).toHaveAttribute('data-analytics-id', 'RANGE_FILTER');
    expect(root).toHaveAttribute('data-analytics-props', payload);
  });

  it('does not strand the analytics-id on inner field wrappers (default usage)', () => {
    render(
      <DateRangeInput
        data-testid='date-range'
        data-analytics-id='RANGE_FILTER'
        defaultValue={{
          start: new CalendarDate(2026, 1, 1),
          end: new CalendarDate(2026, 1, 7),
        }}
      />,
    );

    const root = screen.getByTestId('date-range');
    const innerDivs = root.querySelectorAll('div');
    for (const div of innerDivs) {
      expect(div).not.toHaveAttribute('data-analytics-id', 'RANGE_FILTER');
    }
    // The wrapper itself still has it.
    expect(root).toHaveAttribute('data-analytics-id', 'RANGE_FILTER');
  });

  it('preserves the attr across a controlled value change', () => {
    const { rerender } = render(
      <DateRangeInput
        data-testid='date-range'
        data-analytics-id='RANGE_FILTER'
        defaultValue={{
          start: new CalendarDate(2026, 1, 1),
          end: new CalendarDate(2026, 1, 7),
        }}
      />,
    );

    expect(screen.getByTestId('date-range')).toHaveAttribute('data-analytics-id', 'RANGE_FILTER');

    rerender(
      <DateRangeInput
        data-testid='date-range'
        data-analytics-id='RANGE_FILTER'
        defaultValue={{
          start: new CalendarDate(2026, 6, 1),
          end: new CalendarDate(2026, 6, 30),
        }}
      />,
    );

    expect(screen.getByTestId('date-range')).toHaveAttribute('data-analytics-id', 'RANGE_FILTER');
  });
});

describe('Compound API: per-field analytics', () => {
  it('forwards data-analytics-id to the start field wrapper', () => {
    render(
      <DateRangeProvider>
        <DateRangeStartValue data-testid='start' data-analytics-id='RANGE_START' />
        <DateRangeSeparator />
        <DateRangeEndValue data-testid='end' data-analytics-id='RANGE_END' />
      </DateRangeProvider>,
    );

    const start = screen.getByTestId('start');
    expect(start.tagName).toBe('DIV');
    expect(start).toHaveAttribute('data-analytics-id', 'RANGE_START');
  });

  it('forwards data-analytics-id to the end field wrapper', () => {
    render(
      <DateRangeProvider>
        <DateRangeStartValue data-testid='start' data-analytics-id='RANGE_START' />
        <DateRangeSeparator />
        <DateRangeEndValue data-testid='end' data-analytics-id='RANGE_END' />
      </DateRangeProvider>,
    );

    const end = screen.getByTestId('end');
    expect(end.tagName).toBe('DIV');
    expect(end).toHaveAttribute('data-analytics-id', 'RANGE_END');
  });

  it('forwards data-analytics-props verbatim on each field', () => {
    const startPayload = '{"side":"start"}';
    const endPayload = '{"side":"end"}';
    render(
      <DateRangeProvider>
        <DateRangeStartValue data-testid='start' data-analytics-props={startPayload} />
        <DateRangeSeparator />
        <DateRangeEndValue data-testid='end' data-analytics-props={endPayload} />
      </DateRangeProvider>,
    );

    expect(screen.getByTestId('start')).toHaveAttribute('data-analytics-props', startPayload);
    expect(screen.getByTestId('end')).toHaveAttribute('data-analytics-props', endPayload);
  });

  it('keeps start and end ids isolated (no cross-leak)', () => {
    render(
      <DateRangeProvider>
        <DateRangeStartValue data-testid='start' data-analytics-id='RANGE_START' />
        <DateRangeSeparator />
        <DateRangeEndValue data-testid='end' data-analytics-id='RANGE_END' />
      </DateRangeProvider>,
    );

    expect(screen.getByTestId('start')).toHaveAttribute('data-analytics-id', 'RANGE_START');
    expect(screen.getByTestId('start')).not.toHaveAttribute('data-analytics-id', 'RANGE_END');
    expect(screen.getByTestId('end')).toHaveAttribute('data-analytics-id', 'RANGE_END');
    expect(screen.getByTestId('end')).not.toHaveAttribute('data-analytics-id', 'RANGE_START');
  });
});

describe('Click resolution', () => {
  it('captures clicks on the start field under its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <DateRangeProvider>
        <DateRangeStartValue data-testid='start' data-analytics-id='RANGE_START' />
        <DateRangeSeparator />
        <DateRangeEndValue data-testid='end' data-analytics-id='RANGE_END' />
      </DateRangeProvider>,
    );

    await userEvent.click(screen.getByTestId('start'));

    expect(captured).toHaveBeenCalledWith('RANGE_START');
  });

  it('captures clicks on the end field under its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <DateRangeProvider>
        <DateRangeStartValue data-testid='start' data-analytics-id='RANGE_START' />
        <DateRangeSeparator />
        <DateRangeEndValue data-testid='end' data-analytics-id='RANGE_END' />
      </DateRangeProvider>,
    );

    await userEvent.click(screen.getByTestId('end'));

    expect(captured).toHaveBeenCalledWith('RANGE_END');
  });
});
