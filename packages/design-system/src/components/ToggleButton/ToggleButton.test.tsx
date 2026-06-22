import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToggleButton } from './ToggleButton';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the <button>', () => {
    render(<ToggleButton data-analytics-id='TOGGLE_WRAP'>Wrap</ToggleButton>);

    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-analytics-id', 'TOGGLE_WRAP');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'editor', flag: 'wrap' });

    render(
      <ToggleButton data-analytics-id='TOGGLE_WRAP' data-analytics-props={payload}>
        Wrap
      </ToggleButton>,
    );

    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-analytics-id', 'TOGGLE_WRAP');
    expect(btn).toHaveAttribute('data-analytics-props', payload);
  });

  it('onToggle still fires when consumer attrs are present', async () => {
    const onToggle = vi.fn();

    render(
      <ToggleButton data-analytics-id='TOGGLE_WRAP' onToggle={onToggle}>
        Wrap
      </ToggleButton>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledWith(true, expect.anything());
  });

  it('preserves data-analytics-id across toggle state changes', async () => {
    render(<ToggleButton data-analytics-id='TOGGLE_WRAP'>Wrap</ToggleButton>);

    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-analytics-id', 'TOGGLE_WRAP');

    await userEvent.click(btn);
    expect(btn).toHaveAttribute('data-analytics-id', 'TOGGLE_WRAP');

    await userEvent.click(btn);
    expect(btn).toHaveAttribute('data-analytics-id', 'TOGGLE_WRAP');
  });
});
