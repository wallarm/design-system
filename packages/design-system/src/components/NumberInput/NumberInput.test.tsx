import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { NumberInput } from './NumberInput';

// NumberInput is wrapper-level by current contract — see
// docs/metrics/contract.md. The wrapper <div> is the analytics
// target; the internal <input>, increment, and decrement controls inherit
// the id via SDK closest() resolution and do NOT carry their own ids.

describe('Attribute pass-through (wrapper-level)', () => {
  it('forwards data-analytics-id to the root <div>', () => {
    render(<NumberInput data-testid='number-input' data-analytics-id='ITEMS_PER_PAGE' />);

    const root = screen.getByTestId('number-input');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('data-analytics-id', 'ITEMS_PER_PAGE');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'pagination', field: 'page_size' });

    render(
      <NumberInput
        data-testid='number-input'
        data-analytics-id='ITEMS_PER_PAGE'
        data-analytics-props={payload}
      />,
    );

    const root = screen.getByTestId('number-input');
    expect(root).toHaveAttribute('data-analytics-id', 'ITEMS_PER_PAGE');
    expect(root).toHaveAttribute('data-analytics-props', payload);
  });

  it('does not strand the analytics-id on inner controls (wrapper-level contract)', () => {
    render(<NumberInput data-testid='number-input' data-analytics-id='ITEMS_PER_PAGE' />);

    const root = screen.getByTestId('number-input');
    // The inner input is a real <input>; step triggers are <button>s rendered
    // by Ark UI. None of them should carry the analytics-id themselves —
    // the wrapper is the single analytics surface.
    const input = root.querySelector('input');
    expect(input).not.toBeNull();
    expect(input).not.toHaveAttribute('data-analytics-id');

    const buttons = root.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    for (const btn of buttons) {
      expect(btn).not.toHaveAttribute('data-analytics-id');
    }
  });
});

describe('Click resolution', () => {
  it('captures clicks on the increment button under the wrapper analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <NumberInput
        data-testid='number-input'
        data-analytics-id='ITEMS_PER_PAGE'
        defaultValue='5'
      />,
    );

    const root = screen.getByTestId('number-input');
    const [increment] = root.querySelectorAll<HTMLButtonElement>('button');
    await userEvent.click(increment);

    expect(captured).toHaveBeenCalledWith('ITEMS_PER_PAGE');
  });

  it('captures clicks on the decrement button under the wrapper analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <NumberInput
        data-testid='number-input'
        data-analytics-id='ITEMS_PER_PAGE'
        defaultValue='5'
      />,
    );

    const root = screen.getByTestId('number-input');
    const buttons = root.querySelectorAll<HTMLButtonElement>('button');
    const decrement = buttons[1];
    await userEvent.click(decrement);

    expect(captured).toHaveBeenCalledWith('ITEMS_PER_PAGE');
  });

  it('captures clicks on the inner <input> under the wrapper analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(<NumberInput data-testid='number-input' data-analytics-id='ITEMS_PER_PAGE' />);

    const input = screen.getByTestId('number-input').querySelector('input') as HTMLInputElement;
    await userEvent.click(input);

    expect(captured).toHaveBeenCalledWith('ITEMS_PER_PAGE');
  });
});

describe('Persistence', () => {
  it('keeps the analytics-id on the wrapper after interacting with the input', async () => {
    // We don't assert the value change itself — Ark's increment handlers
    // are pointer-event driven and don't always tick under jsdom. What
    // matters for the metrics contract is that the analytics-id stays put.
    render(
      <NumberInput
        data-testid='number-input'
        data-analytics-id='ITEMS_PER_PAGE'
        defaultValue='5'
      />,
    );

    const root = screen.getByTestId('number-input');
    const input = root.querySelector('input') as HTMLInputElement;
    await userEvent.type(input, '{ArrowUp}');

    expect(screen.getByTestId('number-input')).toHaveAttribute(
      'data-analytics-id',
      'ITEMS_PER_PAGE',
    );
  });
});

describe('Size variants', () => {
  it('defaults to the default (36px) height with no size prop', () => {
    render(<NumberInput data-testid='number-input' />);
    expect(screen.getByTestId('number-input')).toHaveClass('h-36');
  });

  it('renders the medium (32px) height', () => {
    render(<NumberInput data-testid='number-input' size='medium' />);
    expect(screen.getByTestId('number-input')).toHaveClass('h-32');
  });

  it('renders the small (24px) height', () => {
    render(<NumberInput data-testid='number-input' size='small' />);
    expect(screen.getByTestId('number-input')).toHaveClass('h-24');
  });
});
