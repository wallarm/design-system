import { createRef } from 'react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';
import { PaginationEllipsis } from './PaginationEllipsis';
import { PaginationItem } from './PaginationItem';
import { PaginationList } from './PaginationList';
import { PaginationNext } from './PaginationNext';
import { PaginationPageSize } from './PaginationPageSize';
import { PaginationPrevious } from './PaginationPrevious';

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

  it('defaults to left alignment and the "Pagination" aria-label', () => {
    render(
      <Pagination count={50} pageSize={10} data-testid='pg'>
        <span>child</span>
      </Pagination>,
    );
    const nav = screen.getByTestId('pg');
    expect(nav).toBe(screen.getByRole('navigation', { name: 'Pagination' }));
    expect(nav.className).toContain('justify-start');
  });

  it('aligns right when align="right"', () => {
    render(
      <Pagination count={50} pageSize={10} align='right' data-testid='pg'>
        <span>child</span>
      </Pagination>,
    );
    expect(screen.getByTestId('pg').className).toContain('justify-end');
  });

  it('merges a consumer className with the variant classes', () => {
    render(
      <Pagination count={50} pageSize={10} className='custom-class' data-testid='pg'>
        <span>child</span>
      </Pagination>,
    );
    const nav = screen.getByTestId('pg');
    expect(nav.className).toContain('custom-class');
    expect(nav.className).toContain('justify-start');
  });

  it('forwards ref to the underlying nav element', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Pagination ref={ref} count={50} pageSize={10}>
        <span>child</span>
      </Pagination>,
    );
    expect(ref.current?.tagName).toBe('NAV');
  });
});

describe('Pagination size context', () => {
  it('propagates the default medium size to items and ellipsis', () => {
    const { container } = render(
      <Pagination count={500} pageSize={10} page={1}>
        <ul>
          <PaginationItem value={1}>1</PaginationItem>
          <PaginationEllipsis index={0} />
        </ul>
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: 'page 1' }).className).toContain('size-32');
    expect(container.querySelector('[data-slot="pagination-ellipsis"]')?.className).toContain(
      'size-32',
    );
  });

  it('propagates the small size to items and ellipsis', () => {
    const { container } = render(
      <Pagination count={500} pageSize={10} page={1} size='small'>
        <ul>
          <PaginationItem value={1}>1</PaginationItem>
          <PaginationEllipsis index={0} />
        </ul>
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: 'page 1' }).className).toContain('size-24');
    expect(container.querySelector('[data-slot="pagination-ellipsis"]')?.className).toContain(
      'size-24',
    );
  });

  it('maps size to the matching Button height on prev/next', () => {
    const { rerender } = render(
      <Pagination count={50} pageSize={10} size='medium'>
        <PaginationPrevious />
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: /previous/i }).className).toContain('h-32');

    rerender(
      <Pagination count={50} pageSize={10} size='small'>
        <PaginationPrevious />
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: /previous/i }).className).toContain('h-24');
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

  it('navigates to the clicked page', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination count={50} pageSize={10} defaultPage={1} onPageChange={onPageChange}>
        <ul>
          <PaginationItem value={1}>1</PaginationItem>
          <PaginationItem value={3}>3</PaginationItem>
        </ul>
      </Pagination>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }));
  });

  it('merges a consumer className', () => {
    render(
      <Pagination count={50} pageSize={10}>
        <ul>
          <PaginationItem value={1} className='custom-item'>
            1
          </PaginationItem>
        </ul>
      </Pagination>,
    );
    const button = screen.getByRole('button', { name: 'page 1' });
    expect(button.className).toContain('custom-item');
    expect(button.className).toContain('rounded-8');
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
    // not exposed as an interactive element
    expect(screen.queryByRole('button')).toBeNull();
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

  it('wraps every page entry in its own <li>', () => {
    render(
      <Pagination count={200} pageSize={10} page={1}>
        <PaginationList />
      </Pagination>,
    );
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    // one <li> per rendered page button + one per ellipsis
    const buttons = within(list).getAllByRole('button');
    const ellipses = list.querySelectorAll('[data-slot="pagination-ellipsis"]');
    expect(items).toHaveLength(buttons.length + ellipses.length);
  });

  it('renders two ellipses when the active page is in the middle', () => {
    render(
      <Pagination count={500} pageSize={10} page={25} siblingCount={1} boundaryCount={1}>
        <PaginationList />
      </Pagination>,
    );
    const list = screen.getByRole('list');
    expect(list.querySelectorAll('[data-slot="pagination-ellipsis"]')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'page 25' })).toHaveAttribute('aria-current', 'page');
  });

  it('uses the render-prop override to render custom page entries', () => {
    render(
      <Pagination count={200} pageSize={10} page={1}>
        <PaginationList>
          {(pageItem, index) =>
            pageItem.type === 'ellipsis' ? (
              <span data-testid={`custom-ellipsis-${index}`}>gap</span>
            ) : (
              <span data-testid={`custom-page-${pageItem.value}`}>{pageItem.value}</span>
            )
          }
        </PaginationList>
      </Pagination>,
    );
    // custom render is used...
    expect(screen.getByTestId('custom-page-1')).toBeInTheDocument();
    expect(screen.getByTestId('custom-ellipsis-5')).toHaveTextContent('gap');
    // ...and the default PaginationItem buttons are NOT rendered
    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('[data-slot="pagination-item"]')).toBeNull();
  });
});

describe('Pagination prev/next', () => {
  it('renders default labels and arrow icons', () => {
    render(
      <Pagination count={30} pageSize={10} page={2}>
        <PaginationPrevious />
        <PaginationNext />
      </Pagination>,
    );
    const prev = screen.getByRole('button', { name: /previous/i });
    const next = screen.getByRole('button', { name: /next/i });
    expect(prev).toHaveTextContent('Previous');
    expect(next).toHaveTextContent('Next');
    expect(prev.querySelector('svg')).not.toBeNull();
    expect(next.querySelector('svg')).not.toBeNull();
    expect(prev).toHaveAttribute('data-slot', 'pagination-previous');
    expect(next).toHaveAttribute('data-slot', 'pagination-next');
  });

  it('renders a custom label via children', () => {
    render(
      <Pagination count={30} pageSize={10} page={2}>
        <PaginationPrevious>Go back</PaginationPrevious>
      </Pagination>,
    );
    // Ark sets aria-label on the trigger, so assert on the visible text
    expect(screen.getByText('Go back')).toBeInTheDocument();
  });

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

  it('calls onPageChange with the previous page when Previous is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination count={30} pageSize={10} defaultPage={2} onPageChange={onPageChange}>
        <PaginationPrevious />
        <PaginationNext />
      </Pagination>,
    );
    await userEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(onPageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('forwards data-analytics-id to the real buttons', () => {
    render(
      <Pagination count={30} pageSize={10} page={2}>
        <PaginationPrevious data-analytics-id='PREV' />
        <PaginationNext data-analytics-id='NEXT' />
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: /previous/i })).toHaveAttribute(
      'data-analytics-id',
      'PREV',
    );
    expect(screen.getByRole('button', { name: /next/i })).toHaveAttribute(
      'data-analytics-id',
      'NEXT',
    );
  });
});

describe('Pagination uncontrolled navigation', () => {
  it('updates the active page on its own when no controlled page prop is given', async () => {
    render(
      <Pagination count={50} pageSize={10} defaultPage={1}>
        <PaginationList />
        <PaginationNext />
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: 'page 1' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('button', { name: 'page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'page 1' })).not.toHaveAttribute('aria-current');
  });
});

describe('Pagination full composition', () => {
  it('renders prev + list + next together and navigates on page click', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination count={120} pageSize={10} defaultPage={2} onPageChange={onPageChange}>
        <PaginationPrevious />
        <PaginationList />
        <PaginationNext />
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }));
  });
});

describe('PaginationPageSize', () => {
  it('renders the label and the current page size, and changes it', async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination count={200} defaultPageSize={25} onPageSizeChange={onPageSizeChange}>
        <PaginationPageSize options={[10, 25, 50]} data-testid='pg-page-size' />
      </Pagination>,
    );
    expect(screen.getByText('Rows per page')).toBeInTheDocument();
    // current value shown on the select trigger
    // Ark Select uses aria-labelledby (not aria-label) so the combobox name is empty in jsdom;
    // fall back to querying by testid: PaginationPageSize passes data-testid="pg-page-size" to
    // Select, which provides it as TestIdContext, so SelectButton derives "pg-page-size--button"
    const trigger = screen.getByTestId('pg-page-size--button');
    expect(trigger).toHaveTextContent('25');

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: '50' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 50 }));
  });

  it('renders a custom label', () => {
    render(
      <Pagination count={200} defaultPageSize={25}>
        <PaginationPageSize options={[10, 25]} label='Per page' />
      </Pagination>,
    );
    expect(screen.getByText('Per page')).toBeInTheDocument();
    expect(screen.queryByText('Rows per page')).toBeNull();
  });

  it('renders every provided option in the dropdown', async () => {
    render(
      <Pagination count={200} defaultPageSize={25}>
        <PaginationPageSize options={[10, 25, 50]} data-testid='pg-page-size' />
      </Pagination>,
    );
    await userEvent.click(screen.getByTestId('pg-page-size--button'));
    expect(await screen.findByRole('option', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '25' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
  });
});
