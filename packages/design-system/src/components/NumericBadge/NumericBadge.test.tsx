import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NumericBadge } from './NumericBadge';

describe('NumericBadge data-slot', () => {
  it('defaults data-slot to "numeric-badge"', () => {
    render(<NumericBadge data-testid='badge'>1</NumericBadge>);
    expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'numeric-badge');
  });

  it('lets a caller override data-slot', () => {
    render(
      <NumericBadge data-testid='badge' data-slot='timeline-indicator'>
        1
      </NumericBadge>,
    );
    expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'timeline-indicator');
  });
});
