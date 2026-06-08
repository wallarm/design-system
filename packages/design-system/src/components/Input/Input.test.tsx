import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the <input>', () => {
    render(<Input data-testid='input' data-analytics-id='HOST_FILTER' />);

    const input = screen.getByTestId('input');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('data-analytics-id', 'HOST_FILTER');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'host', field: 'name' });

    render(
      <Input data-testid='input' data-analytics-id='HOST_FILTER' data-analytics-props={payload} />,
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('data-analytics-id', 'HOST_FILTER');
    expect(input).toHaveAttribute('data-analytics-props', payload);
  });

  it('consumer attrs override Ark field merge on conflicting keys', () => {
    render(
      <Input data-testid='input' data-analytics-id='X' aria-label='consumer-label' disabled />,
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('data-analytics-id', 'X');
    expect(input).toHaveAttribute('aria-label', 'consumer-label');
    expect(input).toBeDisabled();
  });
});
