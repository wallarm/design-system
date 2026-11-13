import { useState } from 'react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Table } from '../Table';
import type { TableRowSelectionState } from '../types';
import { createTableColumnHelper } from './createTableColumnHelper';

interface Row {
  id: string;
  name: string;
}

const makeData = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({ id: String(i + 1), name: `Row ${i + 1}` }));

const columns = [createTableColumnHelper<Row>().accessor('name', { header: 'Name' })];

const SelectableTable = ({ data }: { data: Row[] }) => {
  const [rowSelection, setRowSelection] = useState<TableRowSelectionState>({});
  return (
    <Table<Row>
      data={data}
      columns={columns as never}
      getRowId={row => row.id}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      data-testid='tbl'
    />
  );
};

const countWindowKeydownListeners = (rowCount: number) => {
  const spy = rs.spyOn(window, 'addEventListener');
  const { unmount } = render(<SelectableTable data={makeData(rowCount)} />);
  const count = spy.mock.calls.filter(([type]) => type === 'keydown').length;
  unmount();
  spy.mockRestore();
  return count;
};

describe('createSelectionColumn: shift-click range selection', () => {
  afterEach(() => {
    rs.restoreAllMocks();
  });

  it('selects the range between the anchor and the shift-clicked row', async () => {
    const user = userEvent.setup();
    render(<SelectableTable data={makeData(4)} />);

    const [, first, , third] = screen.getAllByRole('checkbox') as HTMLInputElement[];
    await user.click(first as HTMLInputElement);
    await user.keyboard('{Shift>}');
    await user.click(third as HTMLInputElement);
    await user.keyboard('{/Shift}');

    const [, ...rows] = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(rows.map(cb => cb.checked)).toEqual([true, true, true, false]);
  });

  it('does not add a window key listener per row', () => {
    expect(countWindowKeydownListeners(10)).toBe(countWindowKeydownListeners(2));
  });
});
