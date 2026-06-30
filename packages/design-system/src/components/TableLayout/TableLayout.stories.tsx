import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../Button';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import {
  TableLayout,
  TableLayoutBody,
  TableLayoutCell,
  TableLayoutColumn,
  type TableLayoutColumnDef,
  TableLayoutColumnGroup,
  type TableLayoutColumnSizingState,
  type TableLayoutColumnVisibilityState,
  TableLayoutHead,
  TableLayoutHeaderCell,
  TableLayoutRow,
  useTableLayoutColumns,
} from '.';

const meta = {
  title: 'Data Display/TableLayout',
  component: TableLayout,
  parameters: {
    layout: 'padded',
  },
  tags: ['beta'],
} satisfies Meta<typeof TableLayout>;

export default meta;

// --- Shared demo data -------------------------------------------------------

interface EndpointRow {
  id: string;
  endpoint: string;
  method: string;
  status: string;
  requests: number;
  lastSeen: string;
}

const rows: EndpointRow[] = [
  {
    id: 'r1',
    endpoint: '/api/v1/login',
    method: 'POST',
    status: 'Active',
    requests: 12840,
    lastSeen: '2 min ago',
  },
  {
    id: 'r2',
    endpoint: '/api/v1/users',
    method: 'GET',
    status: 'Active',
    requests: 9321,
    lastSeen: '5 min ago',
  },
  {
    id: 'r3',
    endpoint: '/api/v1/users/{id}',
    method: 'PATCH',
    status: 'Deprecated',
    requests: 412,
    lastSeen: '1 h ago',
  },
  {
    id: 'r4',
    endpoint: '/api/v1/orders',
    method: 'POST',
    status: 'Active',
    requests: 5870,
    lastSeen: '3 min ago',
  },
  {
    id: 'r5',
    endpoint: '/api/v1/orders/export',
    method: 'GET',
    status: 'Throttled',
    requests: 88,
    lastSeen: '12 min ago',
  },
  {
    id: 'r6',
    endpoint: '/api/v1/admin/flags',
    method: 'DELETE',
    status: 'Blocked',
    requests: 4,
    lastSeen: '1 d ago',
  },
];

const headers: Record<string, string> = {
  endpoint: 'Endpoint',
  method: 'Method',
  status: 'Status',
  requests: 'Requests',
  lastSeen: 'Last seen',
};

const columnDefs: TableLayoutColumnDef[] = [
  { columnId: 'endpoint', width: 240 },
  { columnId: 'method', width: 120 },
  { columnId: 'status', width: 140 },
  { columnId: 'requests', width: 140, align: 'right' },
  { columnId: 'lastSeen', width: 160, align: 'right' },
];

const cellValue = (row: EndpointRow, columnId: string) =>
  String(row[columnId as keyof EndpointRow]);

// --- Stories ----------------------------------------------------------------

/**
 * The easy path: compose the primitives directly. No engine, no column defs —
 * just `TableLayout` wrapping a native `<table>` shape. Reach for the column
 * engine only when you need alignment, pinning, resizing, or visibility.
 */
export const Basic: StoryFn<typeof meta> = () => (
  <TableLayout aria-label='Endpoints'>
    <TableLayoutHead>
      <TableLayoutRow>
        <TableLayoutHeaderCell>Endpoint</TableLayoutHeaderCell>
        <TableLayoutHeaderCell>Method</TableLayoutHeaderCell>
        <TableLayoutHeaderCell>Status</TableLayoutHeaderCell>
        <TableLayoutHeaderCell>Requests</TableLayoutHeaderCell>
        <TableLayoutHeaderCell>Last seen</TableLayoutHeaderCell>
      </TableLayoutRow>
    </TableLayoutHead>
    <TableLayoutBody>
      {rows.map(row => (
        <TableLayoutRow key={row.id} rowId={row.id}>
          <TableLayoutCell>{row.endpoint}</TableLayoutCell>
          <TableLayoutCell>{row.method}</TableLayoutCell>
          <TableLayoutCell>{row.status}</TableLayoutCell>
          <TableLayoutCell>{row.requests}</TableLayoutCell>
          <TableLayoutCell>{row.lastSeen}</TableLayoutCell>
        </TableLayoutRow>
      ))}
    </TableLayoutBody>
  </TableLayout>
);

/**
 * Declare columns with `useTableLayoutColumns` and bind cells by `columnId`.
 * `align` declared on a column is inherited by every cell bound to it — note
 * the right-aligned numeric columns without per-cell classes.
 */
export const Alignment: StoryFn<typeof meta> = () => {
  const { columns, controller } = useTableLayoutColumns(columnDefs);

  return (
    <TableLayout aria-label='Endpoints' controller={controller}>
      <TableLayoutColumnGroup>
        {columns.map(column => (
          <TableLayoutColumn key={column.columnId} {...column} />
        ))}
      </TableLayoutColumnGroup>
      <TableLayoutHead>
        <TableLayoutRow>
          {columns.map(column => (
            <TableLayoutHeaderCell key={column.columnId} columnId={column.columnId}>
              {headers[column.columnId]}
            </TableLayoutHeaderCell>
          ))}
        </TableLayoutRow>
      </TableLayoutHead>
      <TableLayoutBody>
        {rows.map(row => (
          <TableLayoutRow key={row.id} rowId={row.id}>
            {columns.map(column => (
              <TableLayoutCell key={column.columnId} columnId={column.columnId}>
                {cellValue(row, column.columnId)}
              </TableLayoutCell>
            ))}
          </TableLayoutRow>
        ))}
      </TableLayoutBody>
    </TableLayout>
  );
};

/**
 * Pin a column with `pin: 'left'`. The engine resolves cumulative sticky
 * offsets and a boundary shadow; the consumer owns the pin set. The narrow
 * container forces horizontal overflow so the pinned column stays in place.
 */
export const ColumnPinning: StoryFn<typeof meta> = () => {
  const { columns, controller } = useTableLayoutColumns([
    { columnId: 'endpoint', width: 240, pin: 'left' },
    { columnId: 'method', width: 160 },
    { columnId: 'status', width: 160 },
    { columnId: 'requests', width: 160, align: 'right' },
    { columnId: 'lastSeen', width: 200, align: 'right' },
  ]);

  return (
    <TableLayout className='max-w-600' aria-label='Endpoints' controller={controller}>
      <TableLayoutColumnGroup>
        {columns.map(column => (
          <TableLayoutColumn key={column.columnId} {...column} />
        ))}
      </TableLayoutColumnGroup>
      <TableLayoutHead>
        <TableLayoutRow>
          {columns.map(column => (
            <TableLayoutHeaderCell key={column.columnId} columnId={column.columnId}>
              {headers[column.columnId]}
            </TableLayoutHeaderCell>
          ))}
        </TableLayoutRow>
      </TableLayoutHead>
      <TableLayoutBody>
        {rows.map(row => (
          <TableLayoutRow key={row.id} rowId={row.id}>
            {columns.map(column => (
              <TableLayoutCell key={column.columnId} columnId={column.columnId}>
                {cellValue(row, column.columnId)}
              </TableLayoutCell>
            ))}
          </TableLayoutRow>
        ))}
      </TableLayoutBody>
    </TableLayout>
  );
};

/**
 * Mark a column `resizable` and the header grows a drag handle (hover to
 * reveal). The engine tracks the new width in state and surfaces it through
 * `onColumnSizingChange`; this controlled story feeds that width back into the
 * `<col>` so the column visibly reflows, and prints the live width readout.
 */
export const ColumnResizing: StoryFn<typeof meta> = () => {
  const [columnSizing, setColumnSizing] = useState<TableLayoutColumnSizingState>({});
  const { columns, controller } = useTableLayoutColumns(
    [
      { columnId: 'endpoint', width: 240, resizable: true, minWidth: 120 },
      { columnId: 'method', width: 120, resizable: true, minWidth: 80 },
      { columnId: 'status', width: 140 },
      { columnId: 'requests', width: 140, align: 'right' },
      { columnId: 'lastSeen', width: 160, align: 'right' },
    ],
    { columnSizing, onColumnSizingChange: setColumnSizing, columnResizeMode: 'onChange' },
  );

  return (
    <VStack gap={8}>
      <Text size='sm' color='secondary' data-testid='sizing-readout'>
        endpoint: {controller.resolved.endpoint?.width ?? 240}px · method:{' '}
        {controller.resolved.method?.width ?? 120}px
      </Text>
      <TableLayout aria-label='Endpoints' controller={controller}>
        <TableLayoutColumnGroup>
          {columns.map(column => (
            <TableLayoutColumn
              key={column.columnId}
              {...column}
              width={controller.resolved[column.columnId]?.width}
            />
          ))}
        </TableLayoutColumnGroup>
        <TableLayoutHead>
          <TableLayoutRow>
            {columns.map(column => (
              <TableLayoutHeaderCell key={column.columnId} columnId={column.columnId}>
                {headers[column.columnId]}
              </TableLayoutHeaderCell>
            ))}
          </TableLayoutRow>
        </TableLayoutHead>
        <TableLayoutBody>
          {rows.map(row => (
            <TableLayoutRow key={row.id} rowId={row.id}>
              {columns.map(column => (
                <TableLayoutCell key={column.columnId} columnId={column.columnId}>
                  {cellValue(row, column.columnId)}
                </TableLayoutCell>
              ))}
            </TableLayoutRow>
          ))}
        </TableLayoutBody>
      </TableLayout>
    </VStack>
  );
};

/**
 * Visibility is consumer-owned state passed as `columnVisibility`. The engine
 * drops a hidden column from the colgroup, header, and every bound cell at
 * once — toggle the buttons to add or remove a column with no markup changes.
 */
export const ColumnVisibility: StoryFn<typeof meta> = () => {
  const [visibility, setVisibility] = useState<TableLayoutColumnVisibilityState>({});
  const { columns, controller } = useTableLayoutColumns(columnDefs, {
    columnVisibility: visibility,
  });

  const toggle = (columnId: string) =>
    setVisibility(prev => ({ ...prev, [columnId]: prev[columnId] === false }));

  return (
    <VStack gap={8}>
      <HStack gap={8}>
        {columnDefs.map(def => (
          <Button
            key={def.columnId}
            size='small'
            variant={visibility[def.columnId] === false ? 'outline' : 'secondary'}
            color='neutral'
            onClick={() => toggle(def.columnId)}
          >
            {headers[def.columnId]}
          </Button>
        ))}
      </HStack>
      <TableLayout aria-label='Endpoints' controller={controller}>
        <TableLayoutColumnGroup>
          {columns.map(column => (
            <TableLayoutColumn key={column.columnId} {...column} />
          ))}
        </TableLayoutColumnGroup>
        <TableLayoutHead>
          <TableLayoutRow>
            {columns.map(column => (
              <TableLayoutHeaderCell key={column.columnId} columnId={column.columnId}>
                {headers[column.columnId]}
              </TableLayoutHeaderCell>
            ))}
          </TableLayoutRow>
        </TableLayoutHead>
        <TableLayoutBody>
          {rows.map(row => (
            <TableLayoutRow key={row.id} rowId={row.id}>
              {columns.map(column => (
                <TableLayoutCell key={column.columnId} columnId={column.columnId}>
                  {cellValue(row, column.columnId)}
                </TableLayoutCell>
              ))}
            </TableLayoutRow>
          ))}
        </TableLayoutBody>
      </TableLayout>
    </VStack>
  );
};

/**
 * Pinning, resizing, alignment, and visibility composed through a single
 * controller — the engine keeps the colgroup, header, and body coherent.
 */
export const FullFeatured: StoryFn<typeof meta> = () => {
  const [columnSizing, setColumnSizing] = useState<TableLayoutColumnSizingState>({});
  const { columns, controller } = useTableLayoutColumns(
    [
      { columnId: 'endpoint', width: 240, pin: 'left', resizable: true, minWidth: 160 },
      { columnId: 'method', width: 120 },
      { columnId: 'status', width: 160 },
      { columnId: 'requests', width: 160, align: 'right' },
      { columnId: 'lastSeen', width: 200, align: 'right' },
    ],
    { columnSizing, onColumnSizingChange: setColumnSizing },
  );

  return (
    <TableLayout className='max-w-600' aria-label='Endpoints' controller={controller}>
      <TableLayoutColumnGroup>
        {columns.map(column => (
          <TableLayoutColumn
            key={column.columnId}
            {...column}
            width={controller.resolved[column.columnId]?.width}
          />
        ))}
      </TableLayoutColumnGroup>
      <TableLayoutHead>
        <TableLayoutRow>
          {columns.map(column => (
            <TableLayoutHeaderCell key={column.columnId} columnId={column.columnId}>
              {headers[column.columnId]}
            </TableLayoutHeaderCell>
          ))}
        </TableLayoutRow>
      </TableLayoutHead>
      <TableLayoutBody>
        {rows.map(row => (
          <TableLayoutRow key={row.id} rowId={row.id}>
            {columns.map(column => (
              <TableLayoutCell key={column.columnId} columnId={column.columnId}>
                {cellValue(row, column.columnId)}
              </TableLayoutCell>
            ))}
          </TableLayoutRow>
        ))}
      </TableLayoutBody>
    </TableLayout>
  );
};
