import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormatDateTime } from './FormatDateTime';

const VALUE = '2025-12-25T23:59:59';

describe('FormatDateTime tooltip', () => {
  it('renders a tooltip trigger for the relative format', () => {
    render(<FormatDateTime value={VALUE} format='relative' data-testid='dt' />);
    expect(screen.getByTestId('dt')).toHaveAttribute('data-part', 'trigger');
  });

  it('renders no tooltip for the date format', () => {
    render(<FormatDateTime value={VALUE} format='date' data-testid='dt' />);
    expect(screen.getByTestId('dt')).not.toHaveAttribute('data-part');
  });

  it('renders no tooltip for the datetime format', () => {
    render(<FormatDateTime value={VALUE} format='datetime' data-testid='dt' />);
    expect(screen.getByTestId('dt')).not.toHaveAttribute('data-part');
  });
});

describe('FormatDateTime datetime layout', () => {
  it('stacks date over time by default', () => {
    render(<FormatDateTime value={VALUE} format='datetime' data-testid='dt' />);
    expect(screen.getByTestId('dt')).toHaveClass('flex-col');
  });

  it('renders date and time on one line when layout is inline', () => {
    render(<FormatDateTime value={VALUE} format='datetime' layout='inline' data-testid='dt' />);
    const el = screen.getByTestId('dt');
    expect(el).not.toHaveClass('flex-col');
    expect(el).toHaveClass('items-baseline');
  });
});
