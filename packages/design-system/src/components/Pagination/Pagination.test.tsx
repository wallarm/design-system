import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination root', () => {
  it('renders a nav landmark with aria-label, data-slot and align class', () => {
    render(
      <Pagination count={50} pageSize={10} align='center' aria-label='Results' data-testid='pg'>
        <span>child</span>
      </Pagination>,
    );
    const nav = screen.getByRole('navigation', { name: 'Results' });
    expect(nav).toHaveAttribute('data-slot', 'pagination');
    expect(nav).toHaveAttribute('data-testid', 'pg');
    expect(nav.className).toContain('justify-center');
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
