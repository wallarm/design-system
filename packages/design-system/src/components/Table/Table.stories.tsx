import { useCallback, useMemo, useRef, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Copy, Ellipsis, Filter, FilterX, Trash2 } from '../../icons';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { InlineCodeSnippet } from '../CodeSnippet';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '../Drawer';
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
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { HttpMethod } from '../HttpMethod';
import { OverflowList } from '../OverflowList';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { HStack, VStack } from '../Stack';
import { Tag } from '../Tag';
import { Text } from '../Text';
import {
  createLargeGroupedData,
  createLargeSecurityEvents,
  fullFeaturedColumns,
  groupedHeaderData,
  headerColumnIds,
  headerColumns,
  multiplySecurityEvents,
  renderSecurityPreviewContent,
  renderSecurityPreviewHeader,
  type SecurityEvent,
  type SecurityHeaderEntry,
  securityColumnHelper,
  securityColumnIds,
  securityColumns,
  securityEvents,
  useBidirectionalData,
  useInfiniteData,
} from './mocks';
import { Table } from './Table';
import { TableActionBar } from './TableActionBar';
import { TableEmptyState } from './TableEmptyState';
import type {
  TableColumnDef,
  TableColumnPinningState,
  TableColumnSizingState,
  TableExpandedState,
  TableHandle,
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

// Demo of server-side sorting: the consumer (this story) owns sort. TanStack
// only fires `onSortingChange`; we re-derive `data` ourselves to mimic a
// re-fetch that returns pre-sorted rows.
const sortSecurityEvents = (sorting: TableSortingState): SecurityEvent[] => {
  if (sorting.length === 0) return securityEvents;
  const { id, desc } = sorting[0]!;
  const key = id as keyof SecurityEvent;
  const direction = desc ? -1 : 1;
  return [...securityEvents].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av < bv) return -1 * direction;
    if (av > bv) return 1 * direction;
    return 0;
  });
};

export const ManualSorting: StoryFn<typeof meta> = () => {
  const [sorting, setSorting] = useState<TableSortingState>([]);
  const data = useMemo(() => sortSecurityEvents(sorting), [sorting]);

  return (
    <Table
      data={data}
      columns={securityColumns}
      getRowId={row => row.id}
      sorting={sorting}
      onSortingChange={setSorting}
      manualSorting
      data-testid='manual-sort-table'
    />
  );
};

export const LoadingState: StoryFn<typeof meta> = () => (
  <Table data={[]} columns={securityColumns} isLoading />
);

export const LoadingWithData: StoryFn<typeof meta> = () => (
  <Table
    className='h-500'
    data={securityEvents}
    columns={securityColumns}
    getRowId={row => row.id}
    isLoading
  />
);

export const EmptyState: StoryFn<typeof meta> = () => (
  <Table data={[]} columns={securityColumns} getRowId={row => row.id}>
    <TableEmptyState>
      <VStack align='center' justify='center' gap={8}>
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

const renderTableTagsOverflow = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/** Resizable column whose cell hosts an OverflowList — resize it to reflow tags. */
export const ColumnResizingWithOverflowList: StoryFn<typeof meta> = () => {
  const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({});

  const columns = useMemo<TableColumnDef<SecurityEvent>[]>(
    () => [
      ...securityColumns.slice(0, 1),
      securityColumnHelper.display({
        id: 'tags',
        header: 'Tags',
        size: 240,
        cell: ({ row }) => (
          <OverflowList
            className='gap-4'
            items={row.original.tags}
            itemRenderer={(item: string) => <Tag key={item}>{item}</Tag>}
            overflowRenderer={renderTableTagsOverflow}
          />
        ),
      }),
      ...securityColumns.slice(1),
    ],
    [],
  );

  return (
    <Table
      data={securityEvents}
      columns={columns}
      getRowId={row => row.id}
      columnSizing={columnSizing}
      onColumnSizingChange={setColumnSizing}
    />
  );
};

export const ColumnResizingWithPinning: StoryFn<typeof meta> = () => {
  const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({});
  const [columnPinning, setColumnPinning] = useState<TableColumnPinningState>({
    left: ['objectName'],
  });

  return (
    <Table
      className='max-w-920'
      data={securityEvents}
      columns={securityColumns}
      getRowId={row => row.id}
      columnSizing={columnSizing}
      onColumnSizingChange={setColumnSizing}
      columnPinning={columnPinning}
      onColumnPinningChange={setColumnPinning}
    />
  );
};

export const ColumnPinning: StoryFn<typeof meta> = () => {
  const [columnPinning, setColumnPinning] = useState<TableColumnPinningState>({
    left: ['objectName'],
  });

  return (
    <Table
      className='max-w-920'
      data={securityEvents}
      columns={securityColumns}
      getRowId={row => row.id}
      columnPinning={columnPinning}
      onColumnPinningChange={setColumnPinning}
    />
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
            <VStack gap={2}>
              <Text size='xs' color='secondary'>
                Source IP
              </Text>
              <Text size='sm'>{row.original.sourceIp}</Text>
            </VStack>
            <VStack gap={2}>
              <Text size='xs' color='secondary'>
                Provider
              </Text>
              <Text size='sm'>{row.original.sourceProvider}</Text>
            </VStack>
            <VStack gap={2}>
              <Text size='xs' color='secondary'>
                Endpoint
              </Text>
              <HStack gap={4}>
                <HttpMethod method={row.original.endpointMethod} />
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
    <Table
      className='h-500'
      data={largeData}
      columns={securityColumns}
      getRowId={row => row.id}
      virtualized='container'
    />
  );
};

export const WindowVirtualization: StoryFn<typeof meta> = () => {
  const largeData = useMemo(() => createLargeSecurityEvents(1000), []);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({});

  return (
    <Table
      data={largeData}
      columns={securityColumns}
      getRowId={row => row.id}
      virtualized='window'
      columnOrder={columnOrder}
      onColumnOrderChange={setColumnOrder}
      columnSizing={columnSizing}
      onColumnSizingChange={setColumnSizing}
    />
  );
};

export const ScrollToRow: StoryFn<typeof meta> = () => {
  const largeData = useMemo(() => createLargeSecurityEvents(1000), []);
  const tableRef = useRef<TableHandle>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const scroll = (index: number, align: 'start' | 'center' | 'end' | 'auto' = 'center') => {
    const row = largeData[index];
    if (!row) return;
    const ok = tableRef.current?.scrollToRow(row.id, { align, behavior: 'smooth' }) ?? false;
    setLastResult(`scrollToRow("${row.id}", { align: "${align}" }) → ${ok}`);
  };

  return (
    <VStack gap='md'>
      <HStack gap='sm'>
        <Button onClick={() => scroll(0, 'start')}>Top</Button>
        <Button onClick={() => scroll(499, 'center')}>Middle</Button>
        <Button onClick={() => scroll(999, 'end')}>Bottom</Button>
        <Button
          variant='ghost'
          onClick={() => {
            const ok = tableRef.current?.scrollToRow('does-not-exist') ?? false;
            setLastResult(`scrollToRow("does-not-exist") → ${ok}`);
          }}
        >
          Missing id (returns false)
        </Button>
      </HStack>
      {lastResult && (
        <Text size='sm' color='secondary'>
          {lastResult}
        </Text>
      )}
      <Table
        ref={tableRef}
        className='h-500'
        data={largeData}
        columns={securityColumns}
        getRowId={row => row.id}
        virtualized='container'
      />
    </VStack>
  );
};

export const InfiniteScroll: StoryFn<typeof meta> = () => {
  const { data, isFetching, hasMore, totalItems, fetchNextPage } = useInfiniteData();

  return (
    <VStack gap={8}>
      <Text size='sm' color='secondary'>
        Loaded {data.length} of {totalItems} rows {isFetching && '— loading...'}
        {!hasMore && ' — all loaded'}
      </Text>
      <Table
        className='h-500'
        data={data}
        columns={securityColumns}
        getRowId={row => row.id}
        virtualized='container'
        isLoading={isFetching}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={200}
      />
    </VStack>
  );
};

export const InfiniteScrollWindow: StoryFn<typeof meta> = () => {
  const { data, isFetching, hasMore, totalItems, fetchNextPage } = useInfiniteData();

  return (
    <VStack gap={8}>
      <Text size='sm' color='secondary'>
        Loaded {data.length} of {totalItems} rows {isFetching && '— loading...'}
        {!hasMore && ' — all loaded'}
      </Text>
      <Table
        data={data}
        columns={securityColumns}
        getRowId={row => row.id}
        virtualized='window'
        isLoading={isFetching}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={300}
      />
    </VStack>
  );
};

export const BidirectionalInfiniteScroll: StoryFn<typeof meta> = () => {
  const {
    data,
    anchorId,
    isFetchingPrev,
    isFetchingNext,
    hasPrev,
    hasNext,
    fetchPrevPage,
    fetchNextPage,
  } = useBidirectionalData();

  return (
    <VStack gap={8}>
      <Text size='sm' color='secondary'>
        Window of {data.length} rows around the anchor — scroll up for top skeletons, down for
        bottom ones{(isFetchingPrev || isFetchingNext) && ' — loading...'}
        {!hasPrev && ' — top reached'}
        {!hasNext && ' — bottom reached'}
      </Text>
      <Table
        className='h-500'
        data={data}
        columns={securityColumns}
        getRowId={row => row.id}
        virtualized='container'
        isLoading={isFetchingNext}
        isLoadingPrevious={isFetchingPrev}
        initialScrollToRowId={anchorId}
        onStartReached={fetchPrevPage}
        onStartReachedThreshold={200}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={200}
      />
    </VStack>
  );
};

// Same dataset/anchor as BidirectionalInfiniteScroll, but the document itself
// scrolls — the regression mode for prepend compensation, where unrelated page
// content shares the scrollHeight the old delta diffed against.
export const BidirectionalInfiniteScrollWindow: StoryFn<typeof meta> = () => {
  const {
    data,
    anchorId,
    isFetchingPrev,
    isFetchingNext,
    hasPrev,
    hasNext,
    fetchPrevPage,
    fetchNextPage,
  } = useBidirectionalData();

  return (
    <VStack gap={8}>
      <Text size='sm' color='secondary'>
        Window of {data.length} rows around the anchor
        {(isFetchingPrev || isFetchingNext) && ' — loading...'}
        {!hasPrev && ' — top reached'}
        {!hasNext && ' — bottom reached'}
      </Text>
      <Table
        data={data}
        columns={securityColumns}
        getRowId={row => row.id}
        virtualized='window'
        isLoading={isFetchingNext}
        isLoadingPrevious={isFetchingPrev}
        initialScrollToRowId={anchorId}
        onStartReached={fetchPrevPage}
        onStartReachedThreshold={200}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={200}
      />
    </VStack>
  );
};

export const HeaderColumnDescription: StoryFn<typeof meta> = () => {
  const [sorting, setSorting] = useState<TableSortingState>([]);

  const columns = useMemo<TableColumnDef<(typeof securityEvents)[number]>[]>(
    () =>
      securityColumns.map(col => {
        const key = 'accessorKey' in col ? col.accessorKey : undefined;
        if (key === 'objectName') {
          return {
            ...col,
            meta: {
              ...col.meta,
              description: { type: 'text' as const, content: 'Target resource' },
            },
          };
        }
        if (key === 'sourceIp') {
          return {
            ...col,
            meta: {
              ...col.meta,
              description: { type: 'tooltip' as const, content: 'Request origin IP' },
            },
          };
        }
        if (key === 'requests') {
          return {
            ...col,
            meta: { ...col.meta, description: { type: 'tooltip' as const, content: 'Total hits' } },
          };
        }
        if (key === 'parameter') {
          return {
            ...col,
            meta: {
              ...col.meta,
              description: { type: 'text' as const, content: 'Affected param' },
            },
          };
        }
        return col;
      }),
    [],
  );

  return (
    <Table
      data={securityEvents}
      columns={columns}
      getRowId={row => row.id}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
};

export const MasterCellWithActions: StoryFn<typeof meta> = () => {
  const [sorting, setSorting] = useState<TableSortingState>([]);
  const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({});

  const data = useMemo(() => multiplySecurityEvents(), []);

  const columns = useMemo<TableColumnDef<SecurityEvent>[]>(
    () =>
      securityColumns.map((col, i) =>
        i === 0
          ? {
              ...col,
              meta: {
                ...col.meta,
                size: 400,
                resizeType: 'resize',
                renderMenuAction: (row: { original: SecurityEvent }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' color='neutral' size='small' aria-label='More'>
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onSelect={() => navigator.clipboard.writeText(row.original.objectName)}
                      >
                        <DropdownMenuItemIcon>
                          <Copy />
                        </DropdownMenuItemIcon>
                        <DropdownMenuItemText>Copy name</DropdownMenuItemText>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => alert(`Filter: ${row.original.objectName}`)}
                      >
                        <DropdownMenuItemIcon>
                          <Filter />
                        </DropdownMenuItemIcon>
                        <DropdownMenuItemText>Show only</DropdownMenuItemText>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => alert(`Exclude: ${row.original.objectName}`)}
                      >
                        <DropdownMenuItemIcon>
                          <FilterX />
                        </DropdownMenuItemIcon>
                        <DropdownMenuItemText>Exclude</DropdownMenuItemText>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            }
          : col,
      ),
    [],
  );

  return (
    <Table
      className='max-w-920'
      data={data}
      columns={columns}
      getRowId={row => row.id}
      sorting={sorting}
      onSortingChange={setSorting}
      columnSizing={columnSizing}
      onColumnSizingChange={setColumnSizing}
    />
  );
};

export const MasterCellWithDrawer: StoryFn<typeof meta> = () => {
  const [sorting, setSorting] = useState<TableSortingState>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  const data = useMemo(
    () =>
      Array.from({ length: 4 }, (_, batch) =>
        securityEvents.map(row => ({
          ...row,
          id: `${row.id}-${batch}`,
          objectName: batch === 0 ? row.objectName : `${row.objectName} (${batch + 1})`,
        })),
      ).flat(),
    [],
  );

  const columns = useMemo<TableColumnDef<SecurityEvent>[]>(
    () =>
      securityColumns.map((col, i) =>
        i === 0
          ? {
              ...col,
              cell: ({ row }: { row: { original: SecurityEvent } }) => (
                <Text size='xs'>{row.original.objectName}</Text>
              ),
            }
          : col,
      ),
    [],
  );

  const handleMasterCellClick = useCallback((rowId: string) => {
    setActiveRowId(prev => (prev === rowId ? null : rowId));
  }, []);

  const activeRow = useMemo(() => data.find(d => d.id === activeRowId), [data, activeRowId]);

  return (
    <>
      <Table
        className='max-w-920'
        data={data}
        columns={columns}
        getRowId={row => row.id}
        sorting={sorting}
        onSortingChange={setSorting}
        onMasterCellClick={handleMasterCellClick}
        activeRowId={activeRowId}
      />
      <Drawer
        open={!!activeRow}
        onOpenChange={open => {
          if (!open) setActiveRowId(null);
        }}
        modal={false}
        overlay={false}
        closeOnOutsideClick={false}
        width={960}
      >
        <DrawerContent>
          {activeRow ? (
            renderSecurityPreviewHeader({ original: activeRow })
          ) : (
            <DrawerHeader>
              <span />
            </DrawerHeader>
          )}
          <DrawerBody>
            {activeRow && renderSecurityPreviewContent({ original: activeRow })}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
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
    <Table<SecurityHeaderEntry>
      className='h-500'
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
      virtualized='container'
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
