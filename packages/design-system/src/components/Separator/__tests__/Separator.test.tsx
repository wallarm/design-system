import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Separator } from '../Separator';

describe('Separator', () => {
  // Regression guard (surfaced in a consumer app): the root spread `{...props}`
  // after `className={cn(...)}` without pulling `className` out of props, so a
  // consumer `className` REPLACED every computed class (color, size, spacing)
  // instead of merging with them.
  it('keeps its computed classes when a consumer className is passed', () => {
    render(<Separator className='mt-8' data-testid='sep' />);
    const separator = screen.getByTestId('sep');
    expect(separator).toHaveClass('shrink-0', 'bg-border-primary', 'mt-8');
  });

  it('lets a consumer utility override a conflicting computed class (twMerge)', () => {
    render(<Separator spacing={8} className='my-2' data-testid='sep' />);
    const separator = screen.getByTestId('sep');
    expect(separator).toHaveClass('my-2');
    expect(separator).not.toHaveClass('my-8');
  });

  it('forwards arbitrary props to the root element', () => {
    render(<Separator id='divider-1' data-analytics-id='section-split' data-testid='sep' />);
    const separator = screen.getByTestId('sep');
    expect(separator).toHaveAttribute('id', 'divider-1');
    expect(separator).toHaveAttribute('data-analytics-id', 'section-split');
  });
});
