import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CalendarDate } from '../../index';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { DateInput } from './DateInput';

// DateInput is wrapper-level by current contract — see
// docs/metrics/contract.md. The wrapper <div data-slot='date-input'>
// is the analytics target; the inner segment <span>s (react-aria) and the
// inline-end clear <button> inherit the id via SDK closest() resolution and
// do NOT carry their own ids.

describe('Attribute pass-through (wrapper-level)', () => {
  it('forwards data-analytics-id to the wrapper <div>', () => {
    render(<DateInput data-testid='date-input' data-analytics-id='DATE_FROM' />);

    const root = screen.getByTestId('date-input');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('data-analytics-id', 'DATE_FROM');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'filter', field: 'date_from' });

    render(
      <DateInput
        data-testid='date-input'
        data-analytics-id='DATE_FROM'
        data-analytics-props={payload}
      />,
    );

    const root = screen.getByTestId('date-input');
    expect(root).toHaveAttribute('data-analytics-id', 'DATE_FROM');
    expect(root).toHaveAttribute('data-analytics-props', payload);
  });

  it('does not strand the analytics-id on inner segments or controls (wrapper-level contract)', () => {
    render(
      <DateInput
        data-testid='date-input'
        data-analytics-id='DATE_FROM'
        defaultValue={new CalendarDate(2026, 1, 1)}
      />,
    );

    const root = screen.getByTestId('date-input');
    // Segments are rendered as <span>s by react-aria's useDateSegment.
    const segments = root.querySelectorAll('span');
    expect(segments.length).toBeGreaterThan(0);
    for (const segment of segments) {
      expect(segment).not.toHaveAttribute('data-analytics-id');
    }
    // Clear button (rendered when value is present) is a <button aria-label='Clear'>.
    const clear = root.querySelector('button[aria-label="Clear"]');
    expect(clear).not.toBeNull();
    expect(clear).not.toHaveAttribute('data-analytics-id');
  });
});

describe('Click resolution', () => {
  it('captures clicks on the clear button under the wrapper analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <DateInput
        data-testid='date-input'
        data-analytics-id='DATE_FROM'
        defaultValue={new CalendarDate(2026, 1, 1)}
      />,
    );

    const root = screen.getByTestId('date-input');
    const clear = root.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
    await userEvent.click(clear);

    expect(captured).toHaveBeenCalledWith('DATE_FROM');
  });

  it('captures clicks on the wrapper itself under the wrapper analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(<DateInput data-testid='date-input' data-analytics-id='DATE_FROM' />);

    const root = screen.getByTestId('date-input');
    await userEvent.click(root);

    expect(captured).toHaveBeenCalledWith('DATE_FROM');
  });
});

describe('Persistence', () => {
  it('survives a controlled value change without dropping the attribute', () => {
    const { rerender } = render(
      <DateInput
        data-testid='date-input'
        data-analytics-id='DATE_FROM'
        defaultValue={new CalendarDate(2026, 1, 1)}
      />,
    );

    expect(screen.getByTestId('date-input')).toHaveAttribute('data-analytics-id', 'DATE_FROM');

    rerender(
      <DateInput
        data-testid='date-input'
        data-analytics-id='DATE_FROM'
        defaultValue={new CalendarDate(2026, 6, 15)}
      />,
    );

    expect(screen.getByTestId('date-input')).toHaveAttribute('data-analytics-id', 'DATE_FROM');
  });
});
