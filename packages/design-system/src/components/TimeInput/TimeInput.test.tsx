import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Time } from '../../index';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { TimeInput } from './TimeInput';

// TimeInput shares the `DateInputInternal` body with `DateInput` and is
// wrapper-level by the same contract — see docs/metrics/contract.md.
// The wrapper <div data-slot='time-input'> is the analytics target; the inner
// react-aria time segments (hour / minute / second / `dayPeriod` for AM/PM),
// the optional `TimeDropdown` picker, and the inline-end clear <button> all
// inherit the id via SDK closest() resolution.

describe('Attribute pass-through (wrapper-level)', () => {
  it('forwards data-analytics-id to the wrapper <div>', () => {
    render(<TimeInput data-testid='time-input' data-analytics-id='SCHEDULE_TIME' />);

    const root = screen.getByTestId('time-input');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('data-analytics-id', 'SCHEDULE_TIME');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'schedule', field: 'start_time' });

    render(
      <TimeInput
        data-testid='time-input'
        data-analytics-id='SCHEDULE_TIME'
        data-analytics-props={payload}
      />,
    );

    const root = screen.getByTestId('time-input');
    expect(root).toHaveAttribute('data-analytics-id', 'SCHEDULE_TIME');
    expect(root).toHaveAttribute('data-analytics-props', payload);
  });

  it('does not strand the analytics-id on inner segments or controls (wrapper-level contract)', () => {
    render(
      <TimeInput
        data-testid='time-input'
        data-analytics-id='SCHEDULE_TIME'
        defaultValue={new Time(9, 0)}
      />,
    );

    const root = screen.getByTestId('time-input');
    // Time segments (hour / minute / optional dayPeriod) are rendered as <span>s
    // by react-aria's useDateSegment.
    const segments = root.querySelectorAll('span');
    expect(segments.length).toBeGreaterThan(0);
    for (const segment of segments) {
      expect(segment).not.toHaveAttribute('data-analytics-id');
    }
    // Clear button is rendered as <button aria-label='Clear'> when value is set.
    const clear = root.querySelector('button[aria-label="Clear"]');
    expect(clear).not.toBeNull();
    expect(clear).not.toHaveAttribute('data-analytics-id');
  });
});

describe('Click resolution', () => {
  it('captures clicks on the clear button under the wrapper analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <TimeInput
        data-testid='time-input'
        data-analytics-id='SCHEDULE_TIME'
        defaultValue={new Time(9, 0)}
      />,
    );

    const root = screen.getByTestId('time-input');
    const clear = root.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
    await userEvent.click(clear);

    expect(captured).toHaveBeenCalledWith('SCHEDULE_TIME');
  });

  it('captures clicks on the wrapper itself under the wrapper analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(<TimeInput data-testid='time-input' data-analytics-id='SCHEDULE_TIME' />);

    const root = screen.getByTestId('time-input');
    await userEvent.click(root);

    expect(captured).toHaveBeenCalledWith('SCHEDULE_TIME');
  });
});

describe('Persistence', () => {
  it('survives a controlled value change without dropping the attribute', () => {
    const { rerender } = render(
      <TimeInput
        data-testid='time-input'
        data-analytics-id='SCHEDULE_TIME'
        defaultValue={new Time(9, 0)}
      />,
    );

    expect(screen.getByTestId('time-input')).toHaveAttribute('data-analytics-id', 'SCHEDULE_TIME');

    rerender(
      <TimeInput
        data-testid='time-input'
        data-analytics-id='SCHEDULE_TIME'
        defaultValue={new Time(17, 30)}
      />,
    );

    expect(screen.getByTestId('time-input')).toHaveAttribute('data-analytics-id', 'SCHEDULE_TIME');
  });
});

describe('Size variants (confirms InputGroup scaling, no TimeInput code change)', () => {
  it('defaults to the default (36px) InputGroup height with no size prop', () => {
    render(<TimeInput data-testid='time-input' />);
    const group = screen.getByTestId('time-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-36');
  });

  it('renders the medium (32px) InputGroup height', () => {
    render(<TimeInput data-testid='time-input' size='medium' />);
    const group = screen.getByTestId('time-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-32');
  });

  it('renders the small (24px) InputGroup height', () => {
    render(<TimeInput data-testid='time-input' size='small' />);
    const group = screen.getByTestId('time-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-24');
  });
});
