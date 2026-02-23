import { useMemo, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Copy, Filter, FilterX, Trash2 } from '../../icons';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { InlineCodeSnippet } from '../CodeSnippet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuContextTrigger,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuSeparator,
} from '../DropdownMenu';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import {
  createLargeGroupedData,
  createLargeSecurityEvents,
  fullFeaturedColumns,
  groupedHeaderData,
  headerColumnIds,
  headerColumns,
  METHOD_COLORS,
  type SecurityHeaderEntry,
  securityColumnHelper,
  securityColumnIds,
  securityColumns,
  securityEvents,
} from './mocks';
import { Table } from './Table';
import { TableActionBar } from './TableActionBar';
import { TableEmptyState } from './TableEmptyState';
import type {
  TableColumnDef,
  TableColumnPinningState,
  TableColumnSizingState,
  TableExpandedState,
  TableRowSelectionState,
  TableSortingState,
  TableVisibilityState,
} from './types';

const meta = {
  title: 'Data Display/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['beta'],
} satisfies Meta<typeof Table>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => {
  const [sorting, setSorting] = useState<TableSortingState>([{ id: 'firstDetected', desc: true }]);

  return (
    <Table
      data={securityEvents}
      columns={securityColumns}
      getRowId={row => row.id}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
};

export const Sorting: StoryFn<typeof meta> = () => {
  const [sorting, setSorting] = useState<TableSortingState>([]);

  return (
    <Table
      data={securityEvents}
      columns={securityColumns}
      getRowId={row => row.id}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
};

export const LoadingState: StoryFn<typeof meta> = () => (
  <Table data={[]} columns={securityColumns} isLoading />
);

export const EmptyState: StoryFn<typeof meta> = () => (
  <Table data={[]} columns={securityColumns} getRowId={row => row.id}>
    <TableEmptyState>
      <VStack align='center' justify='center' spacing={8}>
        <Text size='sm' weight='medium' color='primary'>
          No results found
        </Text>
        <Text size='sm' color='secondary'>
          Try to apply different filter or reset it.
        </Text>
      </VStack>
    </TableEmptyState>
  </Table>
);

export const ColumnResizing: StoryFn<typeof meta> = () => {
  const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({});

  return (
    <Table
      data={securityEvents}
      columns={securityColumns}
      getRowId={row => row.id}
      columnSizing={columnSizing}
      onColumnSizingChange={setColumnSizing}
    />
  );
};

export const ColumnPinning: StoryFn<typeof meta> = () => {
  const [columnPinning, setColumnPinning] = useState<TableColumnPinningState>({
    left: ['objectName'],
  });

  return (
    <div className='max-w-800'>
      <Table
        data={securityEvents}
        columns={securityColumns}
        getRowId={row => row.id}
        columnPinning={columnPinning}
        onColumnPinningChange={setColumnPinning}
      />
    </div>
  );
};

export const ColumnDragAndDrop: StoryFn<typeof meta> = () => {
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  return (
    <Table
      data={securityEvents}
      columns={securityColumns}
      getRowId={row => row.id}
      columnOrder={columnOrder}
      onColumnOrderChange={setColumnOrder}
    />
  );
};

export const ColumnHeaderMenu: StoryFn<typeof meta> = () => {
  const [sorting, setSorting] = useState<TableSortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<TableVisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<TableColumnPinningState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  return (
    <Table
      data={securityEvents}
      columns={securityColumns}
      getRowId={row => row.id}
      sorting={sorting}
      onSortingChange={setSorting}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
      columnPinning={columnPinning}
      onColumnPinningChange={setColumnPinning}
      columnOrder={columnOrder}
      onColumnOrderChange={setColumnOrder}
    />
  );
};

export const RowSelection: StoryFn<typeof meta> = () => {
  const [rowSelection, setRowSelection] = useState<TableRowSelectionState>({});

  return (
    <Table
      data={securityEvents}
      columns={securityColumns}
      getRowId={row => row.id}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    >
      <TableActionBar>
        <Button variant='ghost' color='neutral-alt' onClick={() => alert('Copy clicked')}>
          <Copy /> Duplicate
        </Button>
        <Button color='brand' onClick={() => alert('Delete clicked')}>
          <Trash2 /> Delete
        </Button>
      </TableActionBar>
    </Table>
  );
};

export const RowGrouping: StoryFn<typeof meta> = () => {
  const [expanded, setExpanded] = useState<TableExpandedState>({ 'group-cto': true });
  const [sorting, setSorting] = useState<TableSortingState>([{ id: 'lastEdited', desc: true }]);
  const [rowSelection, setRowSelection] = useState<TableRowSelectionState>({});

  return (
    <Table<SecurityHeaderEntry>
      data={groupedHeaderData}
      columns={headerColumns}
      getRowId={row => row.id}
      getSubRows={row => row.children}
      expanded={expanded}
      onExpandedChange={setExpanded}
      sorting={sorting}
      onSortingChange={setSorting}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  );
};

export const RowExpanding: StoryFn<typeof meta> = () => {
  const [expanded, setExpanded] = useState<TableExpandedState>({});

  return (
    <Table
      data={securityEvents}
      columns={securityColumns}
      getRowId={row => row.id}
      expanded={expanded}
      onExpandedChange={setExpanded}
      renderExpandedRow={row => (
        <div className='p-16 bg-states-primary-default-alt rounded-8'>
          <Text size='sm' weight='medium'>
            Event Details
          </Text>
          <div className='grid grid-cols-3 gap-8 mt-8'>
            <VStack spacing={2}>
              <Text size='xs' color='secondary'>
                Source IP
              </Text>
              <Text size='sm'>{row.original.sourceIp}</Text>
            </VStack>
            <VStack spacing={2}>
              <Text size='xs' color='secondary'>
                Provider
              </Text>
              <Text size='sm'>{row.original.sourceProvider}</Text>
            </VStack>
            <VStack spacing={2}>
              <Text size='xs' color='secondary'>
                Endpoint
              </Text>
              <HStack spacing={4}>
                <Badge
                  color={METHOD_COLORS[row.original.endpointMethod] ?? 'slate'}
                  type='secondary'
                  size='medium'
                  textVariant='code'
                >
                  {row.original.endpointMethod}
                </Badge>
                <Text size='sm'>{row.original.endpointPath}</Text>
              </HStack>
            </VStack>
          </div>
        </div>
      )}
    />
  );
};

export const ContextMenu: StoryFn<typeof meta> = () => {
  const contextMenuColumns: TableColumnDef<(typeof securityEvents)[number]>[] = [
    securityColumnHelper.accessor('objectName', {
      header: 'Object name',
      cell: ({ getValue }) => (
        <DropdownMenu>
          <DropdownMenuContextTrigger>
            <Text size='sm'>{getValue()}</Text>
          </DropdownMenuContextTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => alert('Copy')}>
              <DropdownMenuItemIcon>
                <Copy />
              </DropdownMenuItemIcon>
              <DropdownMenuItemText>Copy value</DropdownMenuItemText>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => alert('Show Only')}>
              <DropdownMenuItemIcon>
                <Filter />
              </DropdownMenuItemIcon>
              <DropdownMenuItemContent>
                <DropdownMenuItemText>Show only</DropdownMenuItemText>
                <DropdownMenuItemDescription>Filter to matching rows</DropdownMenuItemDescription>
              </DropdownMenuItemContent>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => alert('Exclude')}>
              <DropdownMenuItemIcon>
                <FilterX />
              </DropdownMenuItemIcon>
              <DropdownMenuItemContent>
                <DropdownMenuItemText>Exclude</DropdownMenuItemText>
                <DropdownMenuItemDescription>Filter out matching rows</DropdownMenuItemDescription>
              </DropdownMenuItemContent>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
    securityColumnHelper.accessor('parameter', {
      header: 'Parameters',
      cell: ({ getValue }) => (
        <DropdownMenu>
          <DropdownMenuContextTrigger>
            <InlineCodeSnippet code={getValue()} size='sm' copyable={false} />
          </DropdownMenuContextTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => alert('Execute')}>
              <DropdownMenuItemIcon>
                <Copy />
              </DropdownMenuItemIcon>
              <DropdownMenuItemText>Execute</DropdownMenuItemText>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
    securityColumnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <Badge
            variant='dotted'
            color={status === 'Blocked' ? 'red' : 'yellow'}
            type='secondary'
            size='medium'
          >
            {status}
          </Badge>
        );
      },
    }),
    securityColumnHelper.accessor('cweId', {
      header: 'Security info',
      cell: ({ getValue }) => (
        <Badge color='rose' type='secondary' size='medium' textVariant='code'>
          {getValue()}
        </Badge>
      ),
    }),
  ];

  return <Table data={securityEvents} columns={contextMenuColumns} getRowId={row => row.id} />;
};

export const SettingsMenu: StoryFn<typeof meta> = () => {
  const [columnVisibility, setColumnVisibility] = useState<TableVisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  return (
    <Table
      data={securityEvents}
      columns={securityColumns}
      getRowId={row => row.id}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
      columnOrder={columnOrder}
      onColumnOrderChange={setColumnOrder}
      defaultColumnVisibility={{}}
      defaultColumnOrder={securityColumnIds}
    />
  );
};

export const Virtualization: StoryFn<typeof meta> = () => {
  const largeData = useMemo(() => createLargeSecurityEvents(1000), []);

  return (
    <div className='h-500'>
      <Table data={largeData} columns={securityColumns} getRowId={row => row.id} virtualized />
    </div>
  );
};

export const FullFeatured: StoryFn<typeof meta> = () => {
  const data = useMemo(() => createLargeGroupedData(12, 50), []);

  const [sorting, setSorting] = useState<TableSortingState>([{ id: 'lastEdited', desc: true }]);
  const [rowSelection, setRowSelection] = useState<TableRowSelectionState>({});
  const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({});
  const [columnPinning, setColumnPinning] = useState<TableColumnPinningState>({
    left: ['objectName'],
  });
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<TableVisibilityState>({});
  const [expanded, setExpanded] = useState<TableExpandedState>({
    'group-0': true,
    'group-1': true,
  });

  return (
    <div className='h-500'>
      <Table<SecurityHeaderEntry>
        data={data}
        columns={fullFeaturedColumns}
        getRowId={row => row.id}
        getSubRows={row => row.children}
        // Grouping
        expanded={expanded}
        onExpandedChange={setExpanded}
        // Sorting
        sorting={sorting}
        onSortingChange={setSorting}
        // Row selection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        // Column resizing
        columnSizing={columnSizing}
        onColumnSizingChange={setColumnSizing}
        // Column pinning
        columnPinning={columnPinning}
        onColumnPinningChange={setColumnPinning}
        // Column DnD ordering
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        // Column visibility + settings
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        defaultColumnVisibility={{}}
        defaultColumnOrder={headerColumnIds}
        // Virtual scrolling
        virtualized
      >
        <TableActionBar>
          <Button variant='ghost' color='neutral-alt' onClick={() => alert('Copy clicked')}>
            <Copy /> Duplicate
          </Button>
          <Button color='brand' onClick={() => alert('Delete clicked')}>
            <Trash2 /> Delete
          </Button>
        </TableActionBar>
      </Table>
    </div>
  );
};
