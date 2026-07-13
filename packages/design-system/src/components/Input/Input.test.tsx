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

describe('Size variants', () => {
  it('defaults to the default (36px) height with no size prop', () => {
    render(<Input data-testid='input' />);
    expect(screen.getByTestId('input').className).toContain('h-36');
  });

  it('renders the medium (32px) height', () => {
    render(<Input data-testid='input' size='medium' />);
    expect(screen.getByTestId('input').className).toContain('h-32');
  });

  it('renders the small (24px) height', () => {
    render(<Input data-testid='input' size='small' />);
    expect(screen.getByTestId('input').className).toContain('h-24');
  });

  it('renders the inline-edit (28px) height', () => {
    render(<Input data-testid='input' size='inline-edit' />);
    expect(screen.getByTestId('input').className).toContain('h-28');
  });
});

describe('Placeholder typography', () => {
  it('gives the placeholder an explicit line-height matching text-sm', () => {
    // Regression: `line-height` isn't reliably inherited onto `::placeholder`
    // (Chrome resolves it to the UA-default `normal`, not text-sm's 20px),
    // rendering placeholder text a couple pixels lower than typed text.
    render(<Input data-testid='input' placeholder='Enter name' />);
    expect(screen.getByTestId('input').className).toContain('placeholder:text-sm');
  });
});
