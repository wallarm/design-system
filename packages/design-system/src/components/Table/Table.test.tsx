import type { ReactNode } from 'react';
import { createRef, useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Button } from '../Button';
import { createTableColumnHelper } from './lib';
import { Table } from './Table';
import {
  TableColumnMenu,
  TableColumnMenuHideItem,
  TableColumnMenuMoveLeftItem,
  TableColumnMenuMoveRightItem,
  TableColumnMenuPinItem,
  TableColumnMenuSortItem,
} from './TableColumnMenu';
import {
  TableScrollHandler,
  TableScrollHandlerLeft,
  TableScrollHandlerRight,
} from './TableScrollHandler';
import {
  TableSettingsMenu,
  TableSettingsMenuItem,
  TableSettingsMenuReset,
  TableSettingsMenuSearch,
} from './TableSettingsMenu';
import { TableSortTrigger } from './TableSortTrigger';
import type { TableSortingState } from './types';

// Table is a compound API; the canonical analytics seams are:
//   1. Consumer-rendered cell content via `column.cell(ctx)` render-prop
//   2. Consumer-rendered per-row actions via `column.meta.renderMenuAction(row)`
//   3. Consumer-rendered TableActionBar items
//   4. Wrapper `data-testid` lands on the internal scroll/container root
//   5. `TableSortTrigger` as a direct child of the column's `header` render —
//      suppresses the DS auto-rendered sort icon and exposes the real
//      `<button>` as a per-column analytics target.
//   6. `TableColumnMenu` (+ TableColumnMenuMoveLeftItem / MoveRightItem /
//      SortItem / PinItem / HideItem) as a direct child of `header(ctx)` —
//      suppresses the DS auto-rendered "…" menu and exposes both the trigger
//      `<button>` and every per-item `[role="menuitem"]` as analytics targets.
//   7. Resize / DnD reorder / column sizing remain DS-owned internal controls
//      and stay a documented gap — derive analytics from TanStack's
//      `onColumnSizingChange` / `onColumnOrderChange` callbacks at the
//      consumer's call site. See docs/metrics/contract.md.

interface Row {
  id: string;
  name: string;
  status: string;
}

const data: Row[] = [
  { id: '1', name: 'Alpha', status: 'active' },
  { id: '2', name: 'Bravo', status: 'inactive' },
];

const columnHelper = createTableColumnHelper<Row>();

const baseColumns = [
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: true,
    cell: ctx => (
      <a
        href={`/r/${ctx.row.original.id}`}
        data-testid={`cell-name-${ctx.row.original.id}`}
        data-analytics-id='ROW_OPEN'
        data-analytics-props={`{"id":"${ctx.row.original.id}"}`}
      >
        {ctx.getValue<string>()}
      </a>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    enableSorting: false,
    // `renderMenuAction` only renders inside the master / cut column, so we
    // mark this column accordingly to exercise the seam in tests.
    meta: {
      resizeType: 'cut',
      renderMenuAction: row => (
        <Button
          data-testid={`row-menu-${row.id}`}
          data-analytics-id='ROW_MENU'
          variant='ghost'
          size='small'
        >
          ⋯
        </Button>
      ),
    },
    cell: ctx => ctx.getValue<string>(),
  }),
];

describe('Attribute pass-through (compound seams)', () => {
  it('forwards data-analytics-id from a cell render-prop to the rendered cell node', () => {
    render(<Table data={data} columns={baseColumns} data-testid='table' />);

    const cell = screen.getByTestId('cell-name-1');
    expect(cell.tagName).toBe('A');
    expect(cell).toHaveAttribute('data-analytics-id', 'ROW_OPEN');
    expect(cell).toHaveAttribute('data-analytics-props', '{"id":"1"}');
  });

  it('forwards data-analytics-id from renderMenuAction to the per-row action <button>', () => {
    render(<Table data={data} columns={baseColumns} data-testid='table' />);

    const action = screen.getByTestId('row-menu-1');
    expect(action.tagName).toBe('BUTTON');
    expect(action).toHaveAttribute('data-analytics-id', 'ROW_MENU');
  });

  it('places data-testid on the Table wrapper root', () => {
    render(<Table data={data} columns={baseColumns} data-testid='table' />);
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });
});

describe('Click resolution', () => {
  it('resolves clicks on a cell link to its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(<Table data={data} columns={baseColumns} data-testid='table' />);

    await userEvent.click(screen.getByTestId('cell-name-1'));
    expect(captured).toHaveBeenCalledWith('ROW_OPEN');
  });

  it('resolves clicks on a per-row action button to its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(<Table data={data} columns={baseColumns} data-testid='table' />);

    await userEvent.click(screen.getByTestId('row-menu-1'));
    expect(captured).toHaveBeenCalledWith('ROW_MENU');
  });
});

describe('Sort handler: default (auto-render) — no per-button analytics seam', () => {
  it('does not expose per-column analytics-id on the auto-rendered sort <button>', () => {
    // Default behavior when the consumer does NOT supply a <TableSortTrigger>
    // in the column's `header` — DS auto-renders `TableSortHandler` and that
    // button is intentionally not a public seam. Use `<TableSortTrigger>` or
    // `onSortingChange` instead.
    render(
      <Table data={data} columns={baseColumns} onSortingChange={vi.fn()} data-testid='table' />,
    );

    const sortButton = screen.getByLabelText(/Sort column|Sorted /i);
    expect(sortButton.tagName).toBe('BUTTON');
    expect(sortButton).not.toHaveAttribute('data-analytics-id');
  });

  it('exposes a callback seam (onSortingChange) for consumer-side analytics', async () => {
    const onSortingChange = vi.fn();
    render(
      <Table<Row>
        data={data}
        columns={baseColumns}
        onSortingChange={onSortingChange}
        data-testid='table'
      />,
    );

    const sortButton = screen.getByLabelText(/Sort column|Sorted /i);
    await userEvent.click(sortButton);

    // TanStack-style updater (state or fn(state)). Either form yields the
    // column id + direction at the call site — the callback workaround for
    // consumers that don't need a per-button DOM analytics target.
    expect(onSortingChange).toHaveBeenCalled();
    const arg = onSortingChange.mock.calls[0][0];
    const next: TableSortingState =
      typeof arg === 'function' ? (arg as (s: TableSortingState) => TableSortingState)([]) : arg;
    expect(next[0]?.id).toBe('name');
  });
});

describe('TableSortTrigger: per-column compound seam', () => {
  const columnsWithCustomSort = [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <TableSortTrigger
          column={column}
          data-testid='sort-name'
          data-analytics-id='USERS_SORT_NAME'
          data-analytics-props='{"page":"users"}'
        >
          Name
        </TableSortTrigger>
      ),
      enableSorting: true,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      enableSorting: false,
      cell: ctx => ctx.getValue<string>(),
    }),
  ];

  it('lands data-analytics-id verbatim on the real <button>', () => {
    render(
      <Table
        data={data}
        columns={columnsWithCustomSort}
        onSortingChange={vi.fn()}
        data-testid='table'
      />,
    );

    const button = screen.getByTestId('sort-name');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'USERS_SORT_NAME');
    expect(button).toHaveAttribute('data-analytics-props', '{"page":"users"}');
  });

  it('suppresses the DS auto-rendered sort button — only the consumer-rendered one exists', () => {
    render(
      <Table
        data={data}
        columns={columnsWithCustomSort}
        onSortingChange={vi.fn()}
        data-testid='table'
      />,
    );

    // Exactly one sort button for the `name` column. The default
    // TableSortHandler would have added a second; the children-scan opt-out
    // prevents that.
    const sortButtons = screen.getAllByLabelText(/Sort column|Sorted /i);
    expect(sortButtons).toHaveLength(1);
    expect(sortButtons[0]).toHaveAttribute('data-analytics-id', 'USERS_SORT_NAME');
  });

  it('resolves clicks on the icon to the consumer-supplied analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <Table
        data={data}
        columns={columnsWithCustomSort}
        onSortingChange={vi.fn()}
        data-testid='table'
      />,
    );

    await userEvent.click(screen.getByTestId('sort-name'));
    expect(captured).toHaveBeenCalledWith('USERS_SORT_NAME');
  });

  it('persists the analytics-id across sort direction toggles', async () => {
    const Harness = () => {
      const [sorting, setSorting] = useState<TableSortingState>([]);
      return (
        <Table<Row>
          data={data}
          columns={columnsWithCustomSort}
          sorting={sorting}
          onSortingChange={updater =>
            setSorting(prev => (typeof updater === 'function' ? updater(prev) : updater))
          }
          data-testid='table'
        />
      );
    };

    render(<Harness />);
    await userEvent.click(screen.getByTestId('sort-name'));

    const button = screen.getByTestId('sort-name');
    expect(button).toHaveAttribute('data-analytics-id', 'USERS_SORT_NAME');
    // aria-label switched to reflect the new direction — verifies state
    // change actually happened so persistence is meaningful.
    expect(button).toHaveAttribute('aria-label', expect.stringMatching(/Sorted /i));
  });

  it('composes consumer onClick with internal toggleSorting (both fire)', async () => {
    const consumerClick = vi.fn();
    const onSortingChange = vi.fn();

    render(
      <Table<Row>
        data={data}
        columns={[
          columnHelper.accessor('name', {
            header: ({ column }) => (
              <TableSortTrigger
                column={column}
                data-testid='sort-name'
                data-analytics-id='USERS_SORT_NAME'
                onClick={consumerClick}
              >
                Name
              </TableSortTrigger>
            ),
            enableSorting: true,
          }),
        ]}
        onSortingChange={onSortingChange}
        data-testid='table'
      />,
    );

    await userEvent.click(screen.getByTestId('sort-name'));
    expect(consumerClick).toHaveBeenCalledTimes(1);
    expect(onSortingChange).toHaveBeenCalledTimes(1);
  });

  it('lets consumer onClick short-circuit toggleSorting via preventDefault', async () => {
    const onSortingChange = vi.fn();

    render(
      <Table<Row>
        data={data}
        columns={[
          columnHelper.accessor('name', {
            header: ({ column }) => (
              <TableSortTrigger
                column={column}
                data-testid='sort-name'
                data-analytics-id='USERS_SORT_NAME'
                onClick={e => e.preventDefault()}
              >
                Name
              </TableSortTrigger>
            ),
            enableSorting: true,
          }),
        ]}
        onSortingChange={onSortingChange}
        data-testid='table'
      />,
    );

    await userEvent.click(screen.getByTestId('sort-name'));
    expect(onSortingChange).not.toHaveBeenCalled();
  });

  it('does not affect columns that opt out — auto-render still works elsewhere', () => {
    // Mixed: `name` uses TableSortTrigger, `status` would be sortable but
    // opts out. Confirms the children-scan is per-column, not table-wide.
    const mixedColumns = [
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <TableSortTrigger column={column} data-testid='sort-name' data-analytics-id='SORT_NAME'>
            Name
          </TableSortTrigger>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        enableSorting: true,
      }),
    ];

    render(
      <Table data={data} columns={mixedColumns} onSortingChange={vi.fn()} data-testid='table' />,
    );

    // Two sort buttons total: one from the consumer (with id), one auto-rendered (without).
    const sortButtons = screen.getAllByLabelText(/Sort column|Sorted /i);
    expect(sortButtons).toHaveLength(2);

    const withId = sortButtons.find(b => b.getAttribute('data-analytics-id') === 'SORT_NAME');
    const withoutId = sortButtons.find(b => !b.hasAttribute('data-analytics-id'));
    expect(withId).toBeDefined();
    expect(withoutId).toBeDefined();
  });
});

describe('TableColumnMenu: default auto-render (legacy behavior)', () => {
  // Master column is the first data column ('name'); column menu is rendered
  // only for non-master columns. We add a third column 'category' to exercise
  // both default auto-render and the consumer-supplied override path.
  interface MenuRow {
    id: string;
    name: string;
    status: string;
    category: string;
  }
  const menuData: MenuRow[] = [
    { id: '1', name: 'Alpha', status: 'active', category: 'A' },
    { id: '2', name: 'Bravo', status: 'inactive', category: 'B' },
  ];
  const menuColumnHelper = createTableColumnHelper<MenuRow>();

  const defaultMenuColumns = [
    menuColumnHelper.accessor('name', { header: 'Name', enableSorting: true }),
    menuColumnHelper.accessor('status', {
      header: 'Status',
      enableSorting: true,
      cell: ctx => ctx.getValue<string>(),
    }),
    menuColumnHelper.accessor('category', {
      header: 'Category',
      enableSorting: true,
      cell: ctx => ctx.getValue<string>(),
    }),
  ];

  it('renders the trigger when at least one action is available', () => {
    render(
      <Table<MenuRow>
        data={menuData}
        columns={defaultMenuColumns}
        onSortingChange={vi.fn()}
        onColumnPinningChange={vi.fn()}
        onColumnVisibilityChange={vi.fn()}
        data-testid='table'
      />,
    );

    // Master column ('name') is excluded; remaining sortable+pin+hide cols
    // each get their own trigger.
    const triggers = screen.getAllByRole('button', { name: 'More' });
    expect(triggers).toHaveLength(2);
    triggers.forEach(trigger => {
      expect(trigger).not.toHaveAttribute('data-analytics-id');
    });
  });

  it('exposes onColumnVisibilityChange when the default Hide item is selected', async () => {
    const onColumnVisibilityChange = vi.fn();
    render(
      <Table<MenuRow>
        data={menuData}
        columns={defaultMenuColumns}
        onColumnVisibilityChange={onColumnVisibilityChange}
        data-testid='table'
      />,
    );

    const trigger = screen.getAllByRole('button', { name: 'More' })[0]!;
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByText('Hide'));

    expect(onColumnVisibilityChange).toHaveBeenCalled();
  });
});

describe('TableColumnMenu: per-item compound seam (consumer-supplied children)', () => {
  interface MenuRow {
    id: string;
    name: string;
    status: string;
  }
  const menuData: MenuRow[] = [
    { id: '1', name: 'Alpha', status: 'active' },
    { id: '2', name: 'Bravo', status: 'inactive' },
  ];
  const menuColumnHelper = createTableColumnHelper<MenuRow>();

  const renderColumnsWithMenu = (props: { withSortItems?: boolean } = {}) => [
    menuColumnHelper.accessor('name', { header: 'Name', enableSorting: true }),
    menuColumnHelper.accessor('status', {
      header: ({ column }) => (
        <>
          Status
          <TableColumnMenu
            column={column}
            data-testid='status-menu'
            data-analytics-id='STATUS_MENU'
            data-analytics-props='{"col":"status"}'
          >
            {props.withSortItems && (
              <>
                <TableColumnMenuSortItem
                  direction='asc'
                  data-testid='status-sort-asc'
                  data-analytics-id='STATUS_SORT_ASC'
                />
                <TableColumnMenuSortItem
                  direction='desc'
                  data-testid='status-sort-desc'
                  data-analytics-id='STATUS_SORT_DESC'
                />
              </>
            )}
            <TableColumnMenuPinItem data-testid='status-pin' data-analytics-id='STATUS_PIN' />
            <TableColumnMenuHideItem data-testid='status-hide' data-analytics-id='STATUS_HIDE' />
            <TableColumnMenuMoveLeftItem
              data-testid='status-move-left'
              data-analytics-id='STATUS_MOVE_LEFT'
            />
            <TableColumnMenuMoveRightItem
              data-testid='status-move-right'
              data-analytics-id='STATUS_MOVE_RIGHT'
            />
          </TableColumnMenu>
        </>
      ),
      enableSorting: true,
      cell: ctx => ctx.getValue<string>(),
    }),
  ];

  it('lands data-analytics-id on the trigger <button>', () => {
    render(
      <Table<MenuRow>
        data={menuData}
        columns={renderColumnsWithMenu()}
        onSortingChange={vi.fn()}
        onColumnPinningChange={vi.fn()}
        onColumnVisibilityChange={vi.fn()}
        onColumnOrderChange={vi.fn()}
        data-testid='table'
      />,
    );

    const trigger = screen.getByTestId('status-menu');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'STATUS_MENU');
    expect(trigger).toHaveAttribute('data-analytics-props', '{"col":"status"}');
  });

  it('suppresses the DS auto-rendered menu — only the consumer trigger exists', () => {
    render(
      <Table<MenuRow>
        data={menuData}
        columns={renderColumnsWithMenu()}
        onSortingChange={vi.fn()}
        onColumnPinningChange={vi.fn()}
        onColumnVisibilityChange={vi.fn()}
        data-testid='table'
      />,
    );

    const triggers = screen.getAllByRole('button', { name: 'More' });
    expect(triggers).toHaveLength(1);
    expect(triggers[0]).toHaveAttribute('data-analytics-id', 'STATUS_MENU');
  });

  it('resolves clicks on the trigger to the consumer-supplied analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <Table<MenuRow>
        data={menuData}
        columns={renderColumnsWithMenu()}
        onSortingChange={vi.fn()}
        onColumnPinningChange={vi.fn()}
        onColumnVisibilityChange={vi.fn()}
        data-testid='table'
      />,
    );

    await userEvent.click(screen.getByTestId('status-menu'));
    expect(captured).toHaveBeenCalledWith('STATUS_MENU');
  });

  it('lands data-analytics-id and data-analytics-props verbatim on each menu item', async () => {
    render(
      <Table<MenuRow>
        data={menuData}
        columns={renderColumnsWithMenu({ withSortItems: true })}
        onSortingChange={vi.fn()}
        onColumnPinningChange={vi.fn()}
        onColumnVisibilityChange={vi.fn()}
        onColumnOrderChange={vi.fn()}
        data-testid='table'
      />,
    );

    await userEvent.click(screen.getByTestId('status-menu'));

    const sortAsc = await screen.findByTestId('status-sort-asc');
    const sortDesc = screen.getByTestId('status-sort-desc');
    const pin = screen.getByTestId('status-pin');
    const hide = screen.getByTestId('status-hide');
    // 'status' is the last (and second) column in this 2-column table, so
    // MoveLeft is visible and MoveRight is suppressed.
    const moveLeft = screen.getByTestId('status-move-left');

    expect(sortAsc).toHaveAttribute('data-analytics-id', 'STATUS_SORT_ASC');
    expect(sortDesc).toHaveAttribute('data-analytics-id', 'STATUS_SORT_DESC');
    expect(pin).toHaveAttribute('data-analytics-id', 'STATUS_PIN');
    expect(hide).toHaveAttribute('data-analytics-id', 'STATUS_HIDE');
    expect(moveLeft).toHaveAttribute('data-analytics-id', 'STATUS_MOVE_LEFT');
    expect(screen.queryByTestId('status-move-right')).not.toBeInTheDocument();
  });

  it('PinItem swaps label between "Pin" and "Unpin" without losing the analytics-id', async () => {
    const Harness = () => {
      const [columnPinning, setColumnPinning] = useState<{ left?: string[] }>({});
      return (
        <Table<MenuRow>
          data={menuData}
          columns={renderColumnsWithMenu()}
          columnPinning={columnPinning}
          onColumnPinningChange={updater =>
            setColumnPinning(prev => (typeof updater === 'function' ? updater(prev) : updater))
          }
          data-testid='table'
        />
      );
    };
    render(<Harness />);

    await userEvent.click(screen.getByTestId('status-menu'));
    expect(await screen.findByTestId('status-pin')).toHaveTextContent('Pin');
    await userEvent.click(screen.getByTestId('status-pin'));

    // Re-open after state change and re-resolve — Ark UI re-mounts the
    // dropdown content per-open cycle.
    await userEvent.click(screen.getByTestId('status-menu'));
    const pinAfter = await screen.findByTestId('status-pin');
    expect(pinAfter).toHaveTextContent('Unpin');
    expect(pinAfter).toHaveAttribute('data-analytics-id', 'STATUS_PIN');
  });

  it('hides the MoveRightItem when the column is already last', async () => {
    render(
      <Table<MenuRow>
        data={menuData}
        columns={renderColumnsWithMenu()}
        onColumnOrderChange={vi.fn()}
        data-testid='table'
      />,
    );

    await userEvent.click(screen.getByTestId('status-menu'));
    expect(screen.queryByTestId('status-move-right')).not.toBeInTheDocument();
    expect(screen.getByTestId('status-move-left')).toBeInTheDocument();
  });

  it('composes consumer onSelect with internal action and fires the matching callback', async () => {
    const consumerSelect = vi.fn();
    const onColumnVisibilityChange = vi.fn();

    const cols = [
      menuColumnHelper.accessor('name', { header: 'Name' }),
      menuColumnHelper.accessor('status', {
        header: ({ column }) => (
          <TableColumnMenu
            column={column}
            data-testid='status-menu'
            data-analytics-id='STATUS_MENU'
          >
            <TableColumnMenuHideItem
              data-testid='status-hide'
              data-analytics-id='STATUS_HIDE'
              onSelect={consumerSelect}
            />
          </TableColumnMenu>
        ),
        cell: ctx => ctx.getValue<string>(),
      }),
    ];

    render(
      <Table<MenuRow>
        data={menuData}
        columns={cols}
        onColumnVisibilityChange={onColumnVisibilityChange}
        data-testid='table'
      />,
    );

    await userEvent.click(screen.getByTestId('status-menu'));
    await userEvent.click(await screen.findByTestId('status-hide'));

    expect(consumerSelect).toHaveBeenCalledTimes(1);
    expect(onColumnVisibilityChange).toHaveBeenCalled();
  });
});

describe('TableSettingsMenu: trigger analytics seam', () => {
  it('lands data-analytics-id verbatim on the trigger <button>', () => {
    render(
      <Table<Row>
        data={data}
        columns={baseColumns}
        onColumnVisibilityChange={vi.fn()}
        data-testid='table'
      >
        <TableSettingsMenu
          data-analytics-id='SECURITY_TABLE_SETTINGS'
          data-analytics-props='{"page":"security"}'
        />
      </Table>,
    );

    const trigger = screen.getByRole('button', { name: 'Table settings' });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'SECURITY_TABLE_SETTINGS');
    expect(trigger).toHaveAttribute('data-analytics-props', '{"page":"security"}');
  });

  it('renders exactly one settings trigger when the consumer supplies one', () => {
    render(
      <Table<Row>
        data={data}
        columns={baseColumns}
        onColumnVisibilityChange={vi.fn()}
        data-testid='table'
      >
        <TableSettingsMenu data-analytics-id='SECURITY_TABLE_SETTINGS' />
      </Table>,
    );

    expect(screen.getAllByRole('button', { name: 'Table settings' })).toHaveLength(1);
  });

  it('resolves a real click on the trigger to the consumer analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <Table<Row>
        data={data}
        columns={baseColumns}
        onColumnVisibilityChange={vi.fn()}
        data-testid='table'
      >
        <TableSettingsMenu data-analytics-id='SECURITY_TABLE_SETTINGS' />
      </Table>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Table settings' }));

    expect(captured).toHaveBeenCalledWith('SECURITY_TABLE_SETTINGS');
  });

  it('does not strand the analytics-id on the wrapper element', () => {
    render(
      <Table<Row>
        data={data}
        columns={baseColumns}
        onColumnVisibilityChange={vi.fn()}
        data-testid='table'
      >
        <TableSettingsMenu data-analytics-id='SECURITY_TABLE_SETTINGS' />
      </Table>,
    );

    // The wrapper carries the `settings-menu` testid (derived from the scroll-
    // area container context, so the segment is `table--container--settings-menu`);
    // analytics must live on the inner <button>, not on this wrapper.
    const wrapper = screen.getByTestId('table--container--settings-menu');
    expect(wrapper).not.toHaveAttribute('data-analytics-id');
  });

  it('persists the analytics-id across an open/close transition', async () => {
    render(
      <Table<Row>
        data={data}
        columns={baseColumns}
        onColumnVisibilityChange={vi.fn()}
        data-testid='table'
      >
        <TableSettingsMenu data-analytics-id='SECURITY_TABLE_SETTINGS' />
      </Table>,
    );

    const trigger = screen.getByRole('button', { name: 'Table settings' });
    await userEvent.click(trigger); // open
    await userEvent.keyboard('{Escape}'); // close

    expect(screen.getByRole('button', { name: 'Table settings' })).toHaveAttribute(
      'data-analytics-id',
      'SECURITY_TABLE_SETTINGS',
    );
  });

  it('forwards ref to the trigger <button>', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Table<Row>
        data={data}
        columns={baseColumns}
        onColumnVisibilityChange={vi.fn()}
        data-testid='table'
      >
        <TableSettingsMenu ref={ref} data-analytics-id='SETTINGS_TABLE_SETTINGS' />
      </Table>,
    );

    expect(ref.current).toBe(screen.getByRole('button', { name: 'Table settings' }));
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('auto-renders the default trigger without analytics attrs when no consumer instance is supplied', () => {
    render(
      <Table<Row>
        data={data}
        columns={baseColumns}
        onColumnVisibilityChange={vi.fn()}
        data-testid='table'
      />,
    );

    const triggers = screen.getAllByRole('button', { name: 'Table settings' });
    expect(triggers).toHaveLength(1);
    expect(triggers[0]).not.toHaveAttribute('data-analytics-id');
  });
});

describe('TableSettingsMenu items: partial-override analytics', () => {
  interface ItemRow {
    id: string;
    name: string;
    status: string;
    category: string;
  }

  const itemData: ItemRow[] = [{ id: '1', name: 'Alpha', status: 'active', category: 'x' }];
  const helper = createTableColumnHelper<ItemRow>();
  const itemColumns = [
    helper.accessor('name', { header: 'Name' }),
    helper.accessor('status', { header: 'Status' }),
    helper.accessor('category', { header: 'Category' }),
  ];

  const renderMenu = (children: ReactNode) =>
    render(
      <Table<ItemRow>
        data={itemData}
        columns={itemColumns}
        onColumnVisibilityChange={vi.fn()}
        onColumnOrderChange={vi.fn()}
        data-testid='table'
      >
        <TableSettingsMenu data-analytics-id='SETTINGS_TRIGGER'>{children}</TableSettingsMenu>
      </Table>,
    );

  const openMenu = async () =>
    userEvent.click(screen.getByRole('button', { name: 'Table settings' }));

  it('lands item analytics on the Switch root, not the hidden input', async () => {
    renderMenu(
      <TableSettingsMenuItem
        columnId='status'
        data-analytics-id='SETTINGS_COL_STATUS'
        data-analytics-props='{"col":"status"}'
      />,
    );
    await openMenu();

    // Consumer `<TableSettingsMenu>` renders inside `children` → inside ScrollArea's
    // TestIdProvider (base `table--container`), so the cascade base is `table--container`,
    // NOT `table`. (The default-slot menu, with no consumer instance, would be `table--…`.)
    const root = screen.getByTestId('table--container--settings-menu-item-status');
    expect(root).toHaveAttribute('data-analytics-id', 'SETTINGS_COL_STATUS');
    expect(root).toHaveAttribute('data-analytics-props', '{"col":"status"}');
    // The hidden checkbox inside this switch must not receive analytics attrs.
    expect(within(root).getByRole('checkbox')).not.toHaveAttribute('data-analytics-id');
  });

  it('leaves non-overridden columns rendered as default (no analytics)', async () => {
    renderMenu(<TableSettingsMenuItem columnId='status' data-analytics-id='SETTINGS_COL_STATUS' />);
    await openMenu();

    expect(screen.getByTestId('table--container--settings-menu-item-status')).toHaveAttribute(
      'data-analytics-id',
      'SETTINGS_COL_STATUS',
    );
    expect(screen.getByTestId('table--container--settings-menu-item-category')).not.toHaveAttribute(
      'data-analytics-id',
    );
  });

  it('resolves a real click on the overridden toggle to its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    renderMenu(<TableSettingsMenuItem columnId='status' data-analytics-id='SETTINGS_COL_STATUS' />);
    await openMenu();
    await userEvent.click(screen.getByTestId('table--container--settings-menu-item-status'));

    expect(captured).toHaveBeenCalledWith('SETTINGS_COL_STATUS');
  });

  it('lands reset analytics on the <button>', async () => {
    renderMenu(<TableSettingsMenuReset data-analytics-id='SETTINGS_RESET' />);
    await openMenu();

    const reset = screen.getByTestId('table--container--settings-menu-reset');
    expect(reset.tagName).toBe('BUTTON');
    expect(reset).toHaveAttribute('data-analytics-id', 'SETTINGS_RESET');
  });

  it('lands search analytics on the <input>', async () => {
    renderMenu(<TableSettingsMenuSearch data-analytics-id='SETTINGS_SEARCH' />);
    await openMenu();

    const search = screen.getByTestId('table--container--settings-menu-search');
    expect(search.tagName).toBe('INPUT');
    expect(search).toHaveAttribute('data-analytics-id', 'SETTINGS_SEARCH');
  });

  it('applies analytics to multiple overridden columns independently', async () => {
    renderMenu(
      <>
        <TableSettingsMenuItem columnId='status' data-analytics-id='SETTINGS_COL_STATUS' />
        <TableSettingsMenuItem columnId='category' data-analytics-id='SETTINGS_COL_CATEGORY' />
      </>,
    );
    await openMenu();

    expect(screen.getByTestId('table--container--settings-menu-item-status')).toHaveAttribute(
      'data-analytics-id',
      'SETTINGS_COL_STATUS',
    );
    expect(screen.getByTestId('table--container--settings-menu-item-category')).toHaveAttribute(
      'data-analytics-id',
      'SETTINGS_COL_CATEGORY',
    );
  });

  it('renders the full default menu unchanged when no children are supplied', async () => {
    render(
      <Table<ItemRow>
        data={itemData}
        columns={itemColumns}
        onColumnVisibilityChange={vi.fn()}
        onColumnOrderChange={vi.fn()}
        data-testid='table'
      />,
    );
    await openMenu();

    // No consumer `<TableSettingsMenu>` → the default menu renders in the slot,
    // which sits OUTSIDE ScrollArea, so the cascade base is `table` (not `table--container`).
    // Every column toggle renders; none carry analytics attrs.
    expect(screen.getByTestId('table--settings-menu-item-status')).not.toHaveAttribute(
      'data-analytics-id',
    );
    expect(screen.getByTestId('table--settings-menu-item-category')).not.toHaveAttribute(
      'data-analytics-id',
    );
    expect(screen.getByTestId('table--settings-menu-reset')).not.toHaveAttribute(
      'data-analytics-id',
    );
  });
});

describe('TableScrollHandler: table-level composition analytics', () => {
  interface ScrollRow {
    id: string;
    name: string;
    a: string;
    b: string;
  }

  const scrollData: ScrollRow[] = [{ id: '1', name: 'Alpha', a: 'x', b: 'y' }];
  const scrollHelper = createTableColumnHelper<ScrollRow>();
  const scrollColumns = [
    scrollHelper.accessor('name', { header: 'Name', size: 320 }),
    scrollHelper.accessor('a', { header: 'A' }),
    scrollHelper.accessor('b', { header: 'B' }),
  ];

  let restores: Array<() => void> = [];

  // jsdom reports 0 for layout dims; force horizontal overflow so the master
  // column mounts the scroll-controls anchor slot.
  const forceOverflow = () => {
    const props = ['scrollWidth', 'clientWidth'] as const;
    const values: Record<(typeof props)[number], number> = { scrollWidth: 1000, clientWidth: 400 };
    restores = props.map(prop => {
      const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
      Object.defineProperty(HTMLElement.prototype, prop, {
        configurable: true,
        value: values[prop],
      });
      return () => {
        if (desc) Object.defineProperty(HTMLElement.prototype, prop, desc);
        else delete (HTMLElement.prototype as Record<string, unknown>)[prop];
      };
    });
  };

  afterEach(() => {
    restores.forEach(restore => restore());
    restores = [];
  });

  it('lands analytics on the real scroll <button>s (table-level child)', async () => {
    forceOverflow();
    render(
      <Table<ScrollRow> data={scrollData} columns={scrollColumns} data-testid='table'>
        <TableScrollHandler>
          <TableScrollHandlerLeft data-testid='scroll-left' data-analytics-id='TBL_SCROLL_LEFT' />
          <TableScrollHandlerRight
            data-testid='scroll-right'
            data-analytics-id='TBL_SCROLL_RIGHT'
            data-analytics-props='{"area":"users"}'
          />
        </TableScrollHandler>
      </Table>,
    );

    const left = await screen.findByTestId('scroll-left');
    const right = await screen.findByTestId('scroll-right');
    expect(left.tagName).toBe('BUTTON');
    expect(left).toHaveAttribute('data-analytics-id', 'TBL_SCROLL_LEFT');
    expect(right).toHaveAttribute('data-analytics-id', 'TBL_SCROLL_RIGHT');
    // Opaque payload forwarded byte-for-byte.
    expect(right).toHaveAttribute('data-analytics-props', '{"area":"users"}');
  });

  it('resolves a real click on an enabled control to its analytics-id', async () => {
    forceOverflow();
    const captured = captureAnalyticsClicks();
    render(
      <Table<ScrollRow> data={scrollData} columns={scrollColumns} data-testid='table'>
        <TableScrollHandler>
          <TableScrollHandlerRight
            data-testid='scroll-right'
            data-analytics-id='TBL_SCROLL_RIGHT'
          />
        </TableScrollHandler>
      </Table>,
    );

    // atStart=true → left disabled; atEnd=false → right enabled.
    await userEvent.click(await screen.findByTestId('scroll-right'));
    expect(captured).toHaveBeenCalledWith('TBL_SCROLL_RIGHT');
  });

  it('renders default controls (no analytics) when no consumer handler is supplied', async () => {
    forceOverflow();
    render(<Table<ScrollRow> data={scrollData} columns={scrollColumns} data-testid='table' />);

    const right = await screen.findByRole('button', { name: 'Scroll right' });
    expect(right).not.toHaveAttribute('data-analytics-id');
  });
});
