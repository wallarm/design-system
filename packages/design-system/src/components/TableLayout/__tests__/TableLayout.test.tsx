import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  TableLayout,
  TableLayoutBody,
  TableLayoutCell,
  TableLayoutColumn,
  TableLayoutColumnGroup,
  type TableLayoutHandle,
  TableLayoutHead,
  TableLayoutHeaderCell,
  TableLayoutRow,
} from '..';

const renderTable = (ref?: React.Ref<TableLayoutHandle>) =>
  render(
    <TableLayout ref={ref} aria-label='Policies'>
      <TableLayoutColumnGroup>
        <TableLayoutColumn columnId='title' width={240} />
        <TableLayoutColumn columnId='count' width={120} align='right' />
      </TableLayoutColumnGroup>
      <TableLayoutHead>
        <TableLayoutRow>
          <TableLayoutHeaderCell>Title</TableLayoutHeaderCell>
          <TableLayoutHeaderCell>Count</TableLayoutHeaderCell>
        </TableLayoutRow>
      </TableLayoutHead>
      <TableLayoutBody>
        {[
          { id: 'a', title: 'Alpha', count: 3 },
          { id: 'b', title: 'Beta', count: 7 },
        ].map(row => (
          <TableLayoutRow key={row.id} rowId={row.id}>
            <TableLayoutCell columnId='title'>{row.title}</TableLayoutCell>
            <TableLayoutCell columnId='count'>{row.count}</TableLayoutCell>
          </TableLayoutRow>
        ))}
      </TableLayoutBody>
    </TableLayout>,
  );

describe('TableLayout primitives', () => {
  it('renders an accessible table with header and body cells', () => {
    renderTable();
    const table = screen.getByRole('table', { name: 'Policies' });
    expect(table).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('inherits column align onto cells by columnId', () => {
    renderTable();
    expect(screen.getByRole('cell', { name: '7' })).toHaveClass('text-right');
    expect(screen.getByRole('cell', { name: 'Beta' })).not.toHaveClass('text-right');
  });

  it('does not leak columnId to the DOM as id/name', () => {
    renderTable();
    const cell = screen.getByRole('cell', { name: 'Alpha' });
    expect(cell).not.toHaveAttribute('id');
    expect(cell).not.toHaveAttribute('name');
    expect(cell).not.toHaveAttribute('columnId');
    expect(cell).toHaveAttribute('data-column-id', 'title');
  });

  it('stamps data-row-id from rowId', () => {
    const { container } = renderTable();
    expect(container.querySelector('[data-row-id="b"]')).not.toBeNull();
  });

  it('scrollToRow returns true for a mounted row and false otherwise', () => {
    const ref = createRef<TableLayoutHandle>();
    renderTable(ref);
    const spy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');
    expect(ref.current?.scrollToRow('b')).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(ref.current?.scrollToRow('missing')).toBe(false);
    spy.mockRestore();
  });
});
