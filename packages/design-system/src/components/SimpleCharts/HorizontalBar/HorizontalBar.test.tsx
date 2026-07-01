import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HorizontalBar } from './HorizontalBar';

describe('HorizontalBar — root', () => {
  it('renders the root with data-slot and forwards data-testid + extra props', () => {
    render(
      <HorizontalBar
        data-testid='hb'
        data={[{ name: 'A', value: 1 }]}
        aria-label='distribution'
        className='custom-class'
      />,
    );
    const root = screen.getByTestId('hb');
    expect(root).toHaveAttribute('data-slot', 'horizontal-bar');
    expect(root).toHaveAttribute('aria-label', 'distribution');
    expect(root).toHaveClass('custom-class');
  });

  it('keeps the DOM clean when no data-testid is passed', () => {
    const { container } = render(<HorizontalBar data={[{ name: 'A', value: 1 }]} />);
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
