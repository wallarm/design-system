import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination } from './Pagination';
import { PaginationEllipsis } from './PaginationEllipsis';
import { PaginationItem } from './PaginationItem';
import { PaginationList } from './PaginationList';

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

describe('PaginationList', () => {
  it('auto-renders boundary pages, sibling pages and a single ellipsis', () => {
    render(
      <Pagination count={200} pageSize={10} page={1} siblingCount={1} boundaryCount={1}>
        <PaginationList />
      </Pagination>,
    );
    // 20 total pages. Ark actual: [1] 2 3 4 5 … 20
    // api.pages: [{page,1},{page,2},{page,3},{page,4},{page,5},{ellipsis},{page,20}]
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('data-slot', 'pagination-list');
    expect(screen.getByRole('button', { name: 'page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'page 2' })).toBeInTheDocument();
    // Ark labels the last page as "last page, page 20"
    expect(screen.getByRole('button', { name: 'last page, page 20' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'page 10' })).toBeNull();
    // exactly one ellipsis between sibling group and the trailing boundary
    expect(list.querySelectorAll('[data-slot="pagination-ellipsis"]')).toHaveLength(1);
  });
});

import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { PaginationNext } from './PaginationNext';
import { PaginationPrevious } from './PaginationPrevious';

describe('Pagination prev/next', () => {
  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(
      <Pagination count={30} pageSize={10} page={1}>
        <PaginationPrevious />
        <PaginationNext />
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();

    rerender(
      <Pagination count={30} pageSize={10} page={3}>
        <PaginationPrevious />
        <PaginationNext />
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('calls onPageChange when Next is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination count={30} pageSize={10} defaultPage={1} onPageChange={onPageChange}>
        <PaginationPrevious />
        <PaginationNext />
      </Pagination>,
    );
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });
});
