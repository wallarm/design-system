import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination } from './Pagination';
import { PaginationEllipsis } from './PaginationEllipsis';
import { PaginationItem } from './PaginationItem';

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

describe('PaginationItem', () => {
  it('renders a page button and marks the active page with aria-current', () => {
    render(
      <Pagination count={50} pageSize={10} page={2} size='small'>
        <ul>
          <PaginationItem value={1}>1</PaginationItem>
          <PaginationItem value={2}>2</PaginationItem>
        </ul>
      </Pagination>,
    );
    const active = screen.getByRole('button', { name: 'page 2' });
    expect(active).toHaveAttribute('aria-current', 'page');
    expect(active).toHaveAttribute('data-slot', 'pagination-item');
    expect(active.className).toContain('size-24'); // small
    expect(screen.getByRole('button', { name: 'page 1' })).not.toHaveAttribute('aria-current');
  });

  it('forwards data-analytics-id to the real button', () => {
    render(
      <Pagination count={50} pageSize={10}>
        <ul>
          <PaginationItem value={3} data-analytics-id='PAGE_3'>
            3
          </PaginationItem>
        </ul>
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: 'page 3' })).toHaveAttribute(
      'data-analytics-id',
      'PAGE_3',
    );
  });
});

describe('PaginationEllipsis', () => {
  it('renders a non-interactive, aria-hidden indicator', () => {
    const { container } = render(
      <Pagination count={500} pageSize={10}>
        <ul>
          <PaginationEllipsis index={0} />
        </ul>
      </Pagination>,
    );
    const el = container.querySelector('[data-slot="pagination-ellipsis"]');
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el?.tagName).toBe('DIV');
  });
});
