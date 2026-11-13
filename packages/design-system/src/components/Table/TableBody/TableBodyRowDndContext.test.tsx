import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createTableColumnHelper } from '../lib';
import { Table } from '../Table';

interface Row {
  id: string;
  name: string;
}

const data: Row[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Bravo' },
  { id: '3', name: 'Charlie' },
];

const columns = [createTableColumnHelper<Row>().accessor('name', { header: 'Name' })];

// jsdom has no layout: stack the rows 100px tall so dnd-kit can measure them.
// The drag overlay (portalled out of the table) sits where the dragged first row is.
const ROW_HEIGHT = 100;
const rowRect = (el: Element) => {
  const row = el.closest('[data-row-id]');
  const outsideTable = !el.closest('[data-testid="tbl"]');
  const index = row ? data.findIndex(r => r.id === row.getAttribute('data-row-id')) : -1;
  if (index < 0 && !outsideTable) return DOMRect.fromRect({ x: 0, y: 0, width: 0, height: 0 });
  return DOMRect.fromRect({ x: 0, y: Math.max(index, 0) * ROW_HEIGHT, width: 500, height: 100 });
};

const tick = () => act(() => new Promise(resolve => setTimeout(resolve, 0)));

describe('TableBodyRowDndContext: keyboard reordering', () => {
  afterEach(() => {
    rs.restoreAllMocks();
  });

  it('moves the row onto the next row with Space + ArrowDown + Space', async () => {
    rs.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      return rowRect(this);
    });
    const onRowReorder = rs.fn();
    render(
      <Table<Row>
        data={data}
        columns={columns as never}
        getRowId={row => row.id}
        onRowReorder={onRowReorder}
        data-testid='tbl'
      />,
    );

    const firstRow = screen
      .getAllByTestId('tbl--container--row')
      .find(row => row.getAttribute('data-row-id') === '1') as HTMLElement;
    const handle = firstRow.querySelector('[aria-roledescription="sortable"]') as HTMLElement;

    handle.focus();
    fireEvent.keyDown(handle, { code: 'Space' });
    await tick();
    fireEvent.keyDown(handle, { code: 'ArrowDown' });
    await tick();
    fireEvent.keyDown(handle, { code: 'Space' });
    await tick();

    expect(onRowReorder).toHaveBeenCalledWith({ activeRowId: '1', overRowId: '2' });
  });
});
