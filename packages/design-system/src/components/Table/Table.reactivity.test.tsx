import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { describe, expect, it } from '@rstest/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createTableColumnHelper } from './lib';
import { Table } from './Table';
import { TableActionBar } from './TableActionBar';
import { TableSettingsMenu } from './TableSettingsMenu';
import type {
  TableColumnPinningState,
  TableColumnSizingState,
  TableRowSelectionState,
  TableSortingState,
  TableVisibilityState,
} from './types';

// The Table tree is compiled by the React Compiler. TanStack Table v9 keeps
// row / column / header / cell objects at a stable identity while their getter
// results change, so every test here drives the same interaction more than
// once (and back) — a compiled component that memoized a getter result against
// the stable object would render the first state forever.

interface Row {
  id: string;
  name: string;
  score: number;
  status: string;
}

const data: Row[] = [
  { id: '1', name: 'Bravo', score: 20, status: 'active' },
  { id: '2', name: 'Alpha', score: 30, status: 'inactive' },
  { id: '3', name: 'Charlie', score: 10, status: 'active' },
];

const columnHelper = createTableColumnHelper<Row>();

const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('score', { header: 'Score' }),
  columnHelper.accessor('status', { header: 'Status' }),
];

const getRows = () => screen.getAllByTestId('tbl--container--row');
const getRowNames = () => getRows().map(row => within(row).getAllByRole('cell')[0]?.textContent);
const getHeader = (name: string) => screen.getByRole('columnheader', { name: new RegExp(name) });

describe('Table reactivity under the React Compiler', () => {
  it('reflects every sort toggle in the header and the row order', async () => {
    const user = userEvent.setup();
    const Harness: FC = () => {
      const [sorting, setSorting] = useState<TableSortingState>([]);
      return (
        <Table
          data={data}
          columns={columns}
          getRowId={row => row.id}
          sorting={sorting}
          onSortingChange={setSorting}
          data-testid='tbl'
        />
      );
    };
    render(<Harness />);

    const header = getHeader('Name');
    const sortButton = () => within(header).getByTestId('tbl--container--sort');

    expect(sortButton()).toHaveAttribute('aria-label', 'Sort column');
    expect(header).not.toHaveAttribute('aria-sort');
    expect(getRowNames()).toEqual(['Bravo', 'Alpha', 'Charlie']);

    await user.click(sortButton());
    expect(sortButton()).toHaveAttribute('aria-label', 'Sorted ascending');
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(getRowNames()).toEqual(['Alpha', 'Bravo', 'Charlie']);

    await user.click(sortButton());
    expect(sortButton()).toHaveAttribute('aria-label', 'Sorted descending');
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(getRowNames()).toEqual(['Charlie', 'Bravo', 'Alpha']);

    await user.click(sortButton());
    expect(sortButton()).toHaveAttribute('aria-label', 'Sort column');
    expect(header).not.toHaveAttribute('aria-sort');
    expect(getRowNames()).toEqual(['Bravo', 'Alpha', 'Charlie']);
  });

  it('re-runs consumer header and cell renderers on state changes', async () => {
    const user = userEvent.setup();
    const reactiveColumns = [
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <span data-testid='name-sort-state'>{`${column.getIsSorted()}`}</span>
        ),
        cell: ({ row }) => (
          <span data-testid={`selected-${row.id}`}>{row.getIsSelected() ? 'yes' : 'no'}</span>
        ),
      }),
      columnHelper.accessor('score', { header: 'Score' }),
    ];
    const Harness: FC = () => {
      const [sorting, setSorting] = useState<TableSortingState>([]);
      const [rowSelection, setRowSelection] = useState<TableRowSelectionState>({});
      return (
        <Table
          data={data}
          columns={reactiveColumns}
          getRowId={row => row.id}
          sorting={sorting}
          onSortingChange={setSorting}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          data-testid='tbl'
        />
      );
    };
    render(<Harness />);

    const sortButton = () =>
      within(screen.getByTestId('name-sort-state').closest('th') as HTMLElement).getByTestId(
        'tbl--container--sort',
      );

    expect(screen.getByTestId('name-sort-state')).toHaveTextContent('false');
    await user.click(sortButton());
    expect(screen.getByTestId('name-sort-state')).toHaveTextContent('asc');
    await user.click(sortButton());
    expect(screen.getByTestId('name-sort-state')).toHaveTextContent('desc');

    const firstRowCheckbox = within(getRows()[0] as HTMLElement).getByRole('checkbox');
    const firstRowId = getRows()[0]?.getAttribute('data-row-id');
    expect(screen.getByTestId(`selected-${firstRowId}`)).toHaveTextContent('no');
    await user.click(firstRowCheckbox);
    expect(screen.getByTestId(`selected-${firstRowId}`)).toHaveTextContent('yes');
    await user.click(firstRowCheckbox);
    expect(screen.getByTestId(`selected-${firstRowId}`)).toHaveTextContent('no');
  });

  it('selects all rows from the header and deselects them again, with the action bar following', async () => {
    const user = userEvent.setup();
    const Harness: FC = () => {
      const [rowSelection, setRowSelection] = useState<TableRowSelectionState>({});
      return (
        <Table
          data={data}
          columns={columns}
          getRowId={row => row.id}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          data-testid='tbl'
        >
          <TableActionBar>
            <button type='button'>Delete</button>
          </TableActionBar>
        </Table>
      );
    };
    render(<Harness />);

    const headerCheckbox = () =>
      within(screen.getByTestId('tbl--container--head')).getByRole('checkbox') as HTMLInputElement;
    const selectedRows = () => getRows().filter(row => row.hasAttribute('data-selected'));
    const actionBar = () => screen.getByTestId('tbl--container--action-bar');

    expect(actionBar()).toHaveAttribute('data-state', 'closed');

    for (let round = 0; round < 2; round++) {
      await user.click(headerCheckbox());
      expect(headerCheckbox().checked).toBe(true);
      expect(headerCheckbox().indeterminate).toBe(false);
      expect(selectedRows()).toHaveLength(data.length);
      for (const row of getRows()) expect(row).toHaveAttribute('aria-selected', 'true');
      expect(actionBar()).toHaveAttribute('data-state', 'open');
      expect(within(actionBar()).getByText(`${data.length} selected`)).toBeInTheDocument();

      await user.click(headerCheckbox());
      expect(headerCheckbox().checked).toBe(false);
      expect(headerCheckbox().indeterminate).toBe(false);
      expect(selectedRows()).toHaveLength(0);
      expect(actionBar()).toHaveAttribute('data-state', 'closed');
    }

    // Partial selection: header goes indeterminate, the bar counts one row.
    await user.click(within(getRows()[1] as HTMLElement).getByRole('checkbox'));
    expect(headerCheckbox().indeterminate).toBe(true);
    expect(selectedRows()).toHaveLength(1);
    expect(actionBar()).toHaveAttribute('data-state', 'open');
    expect(within(actionBar()).getByText('1 selected')).toBeInTheDocument();
  });

  it('moves the last-row border between the row and its expanded content on expand and collapse', async () => {
    const user = userEvent.setup();
    render(
      <Table
        data={data}
        columns={columns}
        getRowId={row => row.id}
        renderExpandedRow={row => <div>Details {row.original.name}</div>}
        data-testid='tbl'
      />,
    );

    const lastRow = () => getRows()[getRows().length - 1] as HTMLElement;
    const lastRowDataCells = () =>
      within(lastRow())
        .getAllByRole('cell')
        .filter(cell => !cell.querySelector('button'));

    for (let round = 0; round < 2; round++) {
      for (const cell of lastRowDataCells()) expect(cell.className).toMatch(/\bborder-b-0\b/);
      expect(screen.queryByTestId('tbl--container--row-expanded')).not.toBeInTheDocument();

      await user.click(within(lastRow()).getByRole('button', { name: 'Expand row' }));
      const expanded = screen.getByTestId('tbl--container--row-expanded');
      expect(within(expanded).getByText('Details Charlie').closest('td')?.className).toMatch(
        /\bborder-b-0\b/,
      );
      for (const cell of lastRowDataCells()) expect(cell.className).not.toMatch(/\bborder-b-0\b/);
      expect(within(lastRow()).getByRole('button', { name: 'Collapse row' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );

      await user.click(within(lastRow()).getByRole('button', { name: 'Collapse row' }));
    }
  });

  it('updates header and body cell widths on every column sizing change', async () => {
    const user = userEvent.setup();
    const Harness: FC = () => {
      const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({});
      return (
        <>
          <button type='button' onClick={() => setColumnSizing({ name: 250 })}>
            size-250
          </button>
          <button type='button' onClick={() => setColumnSizing({ name: 300 })}>
            size-300
          </button>
          <Table
            data={data}
            columns={columns}
            getRowId={row => row.id}
            columnSizing={columnSizing}
            onColumnSizingChange={setColumnSizing}
            data-testid='tbl'
          />
        </>
      );
    };
    render(<Harness />);

    const header = getHeader('Name');
    const nameBodyCells = () =>
      getRows().map(row => within(row).getAllByRole('cell')[0] as HTMLElement);
    const expectWidth = (width: string) => {
      expect(header.style.width).toBe(width);
      for (const cell of nameBodyCells()) expect(cell.style.width).toBe(width);
    };
    const initialWidth = header.style.width;

    await user.click(screen.getByRole('button', { name: 'size-250' }));
    expectWidth('250px');
    await user.click(screen.getByRole('button', { name: 'size-300' }));
    expectWidth('300px');
    await user.click(screen.getByRole('button', { name: 'size-250' }));
    expectWidth('250px');
    expect(initialWidth).not.toBe('250px');

    // The resize handle tracks the drag state on and off.
    const handle = within(header).getByTestId('tbl--container--resize');
    for (let round = 0; round < 2; round++) {
      expect(handle).not.toHaveAttribute('data-resizing');
      fireEvent.mouseDown(handle, { clientX: 100 });
      fireEvent.mouseMove(document, { clientX: 140 });
      expect(handle).toHaveAttribute('data-resizing');
      fireEvent.mouseUp(document, { clientX: 140 });
    }
    expect(handle).not.toHaveAttribute('data-resizing');
  });

  it('pins and unpins a column from its header menu', async () => {
    const user = userEvent.setup();
    const Harness: FC = () => {
      const [columnPinning, setColumnPinning] = useState<TableColumnPinningState>({});
      return (
        <Table
          data={data}
          columns={columns}
          getRowId={row => row.id}
          columnPinning={columnPinning}
          onColumnPinningChange={setColumnPinning}
          data-testid='tbl'
        />
      );
    };
    render(<Harness />);

    // Pinning hoists the column to the start, so locate body cells by the header's index.
    const statusCells = () => {
      const header = getHeader('Status');
      const index = Array.from(header.parentElement?.children ?? []).indexOf(header);
      return [
        header,
        ...getRows().map(row => within(row).getAllByRole('cell')[index] as HTMLElement),
      ];
    };
    const openMenu = async () =>
      user.click(within(getHeader('Status')).getByTestId('tbl--container--column-menu'));

    for (let round = 0; round < 2; round++) {
      for (const cell of statusCells()) expect(cell.style.position).toBe('');

      await openMenu();
      await user.click(await screen.findByRole('menuitem', { name: 'Pin' }));
      for (const cell of statusCells()) {
        expect(cell.style.position).toBe('sticky');
        expect(cell.style.left).toMatch(/^\d+(\.\d+)?px$/);
      }

      await openMenu();
      await user.click(await screen.findByRole('menuitem', { name: 'Unpin' }));
    }
  });

  it('hides and shows a column from the settings menu, keeping the switch in sync', async () => {
    const user = userEvent.setup();
    const Harness: FC = () => {
      const [columnVisibility, setColumnVisibility] = useState<TableVisibilityState>({});
      return (
        <Table
          data={data}
          columns={columns}
          getRowId={row => row.id}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          data-testid='tbl'
        >
          <TableSettingsMenu />
        </Table>
      );
    };
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Table settings' }));
    const statusSwitch = () =>
      within(screen.getByTestId('tbl--container--settings-menu-item-status')).getByRole(
        'checkbox',
      ) as HTMLInputElement;

    for (let round = 0; round < 2; round++) {
      expect(statusSwitch().checked).toBe(true);
      expect(screen.getAllByRole('columnheader', { name: /Status/ })).toHaveLength(1);

      await user.click(statusSwitch());
      expect(statusSwitch().checked).toBe(false);
      expect(screen.queryByRole('columnheader', { name: /Status/ })).not.toBeInTheDocument();
      for (const row of getRows()) expect(within(row).getAllByRole('cell')).toHaveLength(2);

      await user.click(statusSwitch());
    }
  });
});

// Consumer callbacks the Table calls as plain functions during render (a
// function `header`, `meta.renderMenuAction`, `renderExpandedRow`) run as part
// of the host component's render. They may call hooks and read context, so the
// compiled host must call them on every render — a cached call would skip the
// consumer's hooks ("Rendered fewer hooks than expected") or keep stale context.
describe('Consumer callbacks under the React Compiler', () => {
  const Label = createContext('first');

  const LabelHarness: FC<{ children: (toggle: () => void) => ReactNode }> = ({ children }) => {
    const [label, setLabel] = useState('first');
    const toggle = () => setLabel(prev => (prev === 'first' ? 'second' : 'first'));
    return <Label.Provider value={label}>{children(toggle)}</Label.Provider>;
  };

  const toggleButton = (toggle: () => void) => (
    <button type='button' data-testid='toggle-label' onClick={toggle}>
      toggle
    </button>
  );

  it('keeps a function header with hooks working across non-state re-renders', async () => {
    const user = userEvent.setup();
    const hookColumns = [
      columnHelper.accessor('name', {
        header: () => {
          const [text] = useState('Hooked name');
          return <span data-testid='hook-header'>{text}</span>;
        },
      }),
      columnHelper.accessor('score', { header: 'Score' }),
    ];
    const Harness: FC = () => {
      const [isLoading, setIsLoading] = useState(false);
      return (
        <>
          <button type='button' data-testid='toggle-loading' onClick={() => setIsLoading(v => !v)}>
            loading
          </button>
          <Table
            data={data}
            columns={hookColumns}
            getRowId={row => row.id}
            isLoading={isLoading}
            data-testid='tbl'
          />
        </>
      );
    };
    render(<Harness />);

    for (let round = 0; round < 2; round++) {
      await user.click(screen.getByTestId('toggle-loading'));
      expect(screen.getByTestId('hook-header')).toHaveTextContent('Hooked name');
      await user.click(screen.getByTestId('toggle-loading'));
      expect(screen.getByTestId('hook-header')).toHaveTextContent('Hooked name');
    }
  });

  it('re-reads context in a function header', async () => {
    const user = userEvent.setup();
    const contextColumns = [
      columnHelper.accessor('name', {
        header: () => <span data-testid='ctx-header'>{useContext(Label)}</span>,
      }),
    ];
    render(
      <LabelHarness>
        {toggle => (
          <>
            {toggleButton(toggle)}
            <Table
              data={data}
              columns={contextColumns}
              getRowId={row => row.id}
              data-testid='tbl'
            />
          </>
        )}
      </LabelHarness>,
    );

    expect(screen.getByTestId('ctx-header')).toHaveTextContent('first');
    await user.click(screen.getByTestId('toggle-label'));
    expect(screen.getByTestId('ctx-header')).toHaveTextContent('second');
    await user.click(screen.getByTestId('toggle-label'));
    expect(screen.getByTestId('ctx-header')).toHaveTextContent('first');
  });

  it('re-reads context in renderMenuAction', async () => {
    const user = userEvent.setup();
    const menuColumns = [
      columnHelper.accessor('name', {
        header: 'Name',
        meta: {
          resizeType: 'cut',
          renderMenuAction: row => (
            <span data-testid={`menu-action-${row.id}`}>{useContext(Label)}</span>
          ),
        },
      }),
      columnHelper.accessor('score', { header: 'Score' }),
    ];
    render(
      <LabelHarness>
        {toggle => (
          <>
            {toggleButton(toggle)}
            <Table data={data} columns={menuColumns} getRowId={row => row.id} data-testid='tbl' />
          </>
        )}
      </LabelHarness>,
    );

    expect(screen.getByTestId('menu-action-1')).toHaveTextContent('first');
    await user.click(screen.getByTestId('toggle-label'));
    expect(screen.getByTestId('menu-action-1')).toHaveTextContent('second');
    await user.click(screen.getByTestId('toggle-label'));
    expect(screen.getByTestId('menu-action-1')).toHaveTextContent('first');
  });

  it('keeps hooks and re-reads context in renderExpandedRow', async () => {
    const user = userEvent.setup();
    render(
      <LabelHarness>
        {toggle => (
          <>
            {toggleButton(toggle)}
            <Table
              data={data}
              columns={columns}
              getRowId={row => row.id}
              renderExpandedRow={row => {
                const [prefix] = useState('label:');
                return (
                  <span data-testid={`expanded-${row.id}`}>
                    {prefix} {useContext(Label)}
                  </span>
                );
              }}
              data-testid='tbl'
            />
          </>
        )}
      </LabelHarness>,
    );

    await user.click(within(getRows()[0]).getByRole('button', { name: 'Expand row' }));
    expect(screen.getByTestId('expanded-1')).toHaveTextContent('first');
    await user.click(screen.getByTestId('toggle-label'));
    expect(screen.getByTestId('expanded-1')).toHaveTextContent('second');
    await user.click(screen.getByTestId('toggle-label'));
    expect(screen.getByTestId('expanded-1')).toHaveTextContent('first');
  });
});
