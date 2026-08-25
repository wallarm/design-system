import type { FC } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Copy, Database, Ellipsis, Filter, FilterX, SearchX, Trash2 } from '../../icons';
import { Badge } from '../Badge';
import {
  BulkBarSummaryClear,
  BulkBarSummaryCount,
  BulkBarSummarySelectAll,
  BulkBarSummarySeparator,
} from '../BulkBar';
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
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../EmptyState';
import { HttpMethod } from '../HttpMethod';
import { OverflowList } from '../OverflowList';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPageSize,
  PaginationPrevious,
  useClientPagination,
} from '../Pagination';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import type { SelectDataItem } from '../Select';
import { HStack, VStack } from '../Stack';
import { Tag } from '../Tag';
import { Text } from '../Text';
import { EDITABLE_CELL_COLUMN_META, EditableSelectCell, EditableTextCell } from './EditableCell';
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
import { TableActionBar, TableActionBarSelection } from './TableActionBar';
import {
  TableColumnMenu,
  TableColumnMenuHideItem,
  TableColumnMenuMoveLeftItem,
  TableColumnMenuMoveRightItem,
  TableColumnMenuPinItem,
  TableColumnMenuSortItem,
} from './TableColumnMenu';
import { TableEmptyState } from './TableEmptyState';
import {
  TableScrollHandler,
  TableScrollHandlerLeft,
  TableScrollHandlerRight,
} from './TableScrollHandler';
import { TableSortTrigger } from './TableSortTrigger';
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

const DESCRIPTION = [
  'The grid for many records of one shape — reach for a `Card` grid when a row reads better as an object than as a set of columns, and for `Attribute` when you are showing one record rather than many.',
  'Everything interactive is controlled: sorting, selection, expansion, column order, pinning, sizing and visibility are each a state prop with a callback, so nothing moves unless you move it, and `manualSorting` hands the sort to the server.',
  'Filtering belongs above the grid in a `FilterInput`, and a long collection scrolls rather than paginates — `Pagination` is the deliberate exception, for when a page number is part of the task.',
].join(' ');

const meta = {
  title: 'Data Display/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
  },
  tags: ['beta'],
} satisfies Meta<typeof Table>;

export default meta;

/**
 * The minimum — `data`, `columns`, `getRowId` and a column to open sorted on. The header stays
 * put as the body scrolls.
 */
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

// "Rows per page" + page navigation share a right-aligned footer below the table.
/**
 * `useClientPagination` slices the rows and the pager sits right-aligned below the table,
 * sharing its footer with the rows-per-page control.
 */
export const WithPagination: StoryFn<typeof meta> = () => {
  const allData = useMemo(() => createLargeSecurityEvents(47), []);
  const { pageData, ...pagination } = useClientPagination(allData, 10);

  return (
    <VStack gap={12}>
      <Table data={pageData} columns={securityColumns} getRowId={row => row.id} />
      <Pagination {...pagination} align='right' aria-label='Security events'>
        <PaginationPageSize options={[10, 25, 50]} />
        <PaginationPrevious />
        <PaginationList />
        <PaginationNext />
      </Pagination>
    </VStack>
  );
};

/**
 * Sorting held in state, so the arrow and the row order are the same fact — click a header to
 * cycle through the directions.
 */
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

/**
 * `manualSorting` stops the table sorting anything itself: it only reports the change, and the
 * story re-derives `data` the way a refetch would.
 */
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

// Showcase: every analytics seam exposed by `<Table>` today, end-to-end.
//
// DOM seams (attribute lands on the real interactive target, document-level
// SDKs resolve via `closest('[data-analytics-id]')`):
//   • Sort trigger        — `<TableSortTrigger column={...} data-analytics-id=...>`
//                           rendered as a direct child of `header(ctx)`.
//   • Column header menu  — `<TableColumnMenu column={...} data-analytics-id=...>`
//                           on the trigger button, plus per-item analytics on
//                           `<TableColumnMenuSortItem>`, `<TableColumnMenuPinItem>`,
//                           `<TableColumnMenuHideItem>`, `<TableColumnMenuMoveLeftItem>`,
//                           `<TableColumnMenuMoveRightItem>`.
//   • Cell content        — consumer JSX from `column.cell(ctx)`; analytics
//                           sit on the rendered `<a>` / `<button>`.
//   • Per-row actions     — consumer JSX from `meta.renderMenuAction(row)`;
//                           analytics sit on the trigger and each menu item.
//   • TableActionBar      — consumer-rendered bulk action buttons (children).
//   • Selection summary   — `<TableActionBarSelection>` override composed from
//                           `<BulkBarSummarySelectAll>` / `<BulkBarSummaryClear>`;
//                           analytics sit on the real "Select all" / "Clear"
//                           `<button>`s (DS keeps toggle / reset wiring).
//   • Scroll controls     — `<TableScrollHandler>` as a `Table` child, with
//                           `<TableScrollHandlerLeft>` / `<TableScrollHandlerRight>`
//                           carrying analytics; portaled into the master header.
//   • Expanded row        — consumer JSX from `renderExpandedRow(row)`.
//   • Wrapper testid      — `<Table data-testid=...>` lands on the
//                           scroll-container `<div>`.
//
// Callback seams (state-level signal; richer than a click event because the
// payload carries the resulting state — direction, visibility, order, etc.):
//   • `onSortingChange(u)`             — resulting sort column + direction
//   • `onRowSelectionChange(u)`        — selected row map
//   • `onExpandedChange(u)`            — expanded row map
//   • `onColumnVisibilityChange(u)`    — visibility map (Settings menu)
//   • `onColumnOrderChange(u)`         — column order (Settings menu DnD)
//   • `onColumnPinningChange(u)`       — pin state (column-header menu)
//   • `onColumnSizingChange(u)`        — final width (resize handle)
//   • `onMasterCellClick(rowId)`       — master-cell click
//
// Pending DS work (no DOM seam yet — callback-only): selection checkbox,
// expand toggle, master-cell click, resize handle.
/**
 * Every analytics seam at once — `TableSortTrigger`, `TableColumnMenu` and each of its items,
 * the action bar, the scroll handlers — plus the state callbacks, which carry the resulting
 * sort, selection and column layout rather than just a click.
 */
export const WithAnalytics: StoryFn<typeof meta> = () => {
  const [sorting, setSorting] = useState<TableSortingState>([]);
  const [rowSelection, setRowSelection] = useState<TableRowSelectionState>({});
  const [expanded, setExpanded] = useState<TableExpandedState>({});
  const [columnVisibility, setColumnVisibility] = useState<TableVisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnPinning, setColumnPinning] = useState<TableColumnPinningState>({});
  const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({});

  // Pretend SDK call — every analytics signal in this story funnels through
  // it so the Storybook actions panel shows one consistent stream.
  const track = useCallback(
    (event: string, props?: Record<string, unknown>) =>
      // biome-ignore lint/suspicious/noConsole: demo story stand-in for an SDK call
      console.info('[analytics]', event, props ?? {}),
    [],
  );

  const columnsWithAnalytics = useMemo<TableColumnDef<SecurityEvent>[]>(
    () => [
      // Master column — sortable header, link cell with analytics, per-row
      // menu action with analytics on every menu item.
      securityColumnHelper.accessor('objectName', {
        header: ({ column }) => (
          <TableSortTrigger
            column={column}
            data-analytics-id='SECURITY_SORT_OBJECT_NAME'
            data-analytics-props='{"surface":"events-table"}'
          >
            Object name
          </TableSortTrigger>
        ),
        size: 320,
        enableSorting: true,
        meta: {
          sortType: 'text' as const,
          resizeType: 'cut' as const,
          renderMenuAction: row => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  color='neutral'
                  size='small'
                  aria-label='Row actions'
                  data-analytics-id='SECURITY_ROW_MENU_OPEN'
                  data-analytics-props={`{"rowId":"${row.original.id}"}`}
                >
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  data-analytics-id='SECURITY_ROW_COPY_NAME'
                  data-analytics-props={`{"rowId":"${row.original.id}"}`}
                  onSelect={() => navigator.clipboard.writeText(row.original.objectName)}
                >
                  <DropdownMenuItemIcon>
                    <Copy />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemText>Copy name</DropdownMenuItemText>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-analytics-id='SECURITY_ROW_FILTER'
                  data-analytics-props={`{"rowId":"${row.original.id}"}`}
                  onSelect={() => track('SECURITY_ROW_FILTER_APPLIED', { rowId: row.original.id })}
                >
                  <DropdownMenuItemIcon>
                    <Filter />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemText>Show only</DropdownMenuItemText>
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-analytics-id='SECURITY_ROW_EXCLUDE'
                  data-analytics-props={`{"rowId":"${row.original.id}"}`}
                  onSelect={() => track('SECURITY_ROW_EXCLUDE_APPLIED', { rowId: row.original.id })}
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
        cell: ({ row }) => (
          <a
            href={`#/events/${row.original.id}`}
            data-analytics-id='SECURITY_ROW_OPEN'
            data-analytics-props={`{"rowId":"${row.original.id}"}`}
          >
            {row.original.objectName}
          </a>
        ),
      }),
      // Other sortable columns — each one declares its own sort target.
      securityColumnHelper.accessor('requests', {
        header: ({ column }) => (
          <TableSortTrigger column={column} data-analytics-id='SECURITY_SORT_REQUESTS'>
            Requests
          </TableSortTrigger>
        ),
        size: 140,
        enableSorting: true,
      }),
      securityColumnHelper.accessor('sourceIp', {
        header: ({ column }) => (
          <TableSortTrigger column={column} data-analytics-id='SECURITY_SORT_SOURCE_IP'>
            Source
          </TableSortTrigger>
        ),
        size: 180,
        enableSorting: true,
        meta: { sortType: 'text' as const },
      }),
      // Status column — demonstrates the column header menu seam with
      // per-item analytics, rendered as a sibling of the sort trigger inside
      // a Fragment.
      securityColumnHelper.accessor('status', {
        header: ({ column }) => (
          <>
            <TableSortTrigger column={column} data-analytics-id='SECURITY_SORT_STATUS'>
              Status
            </TableSortTrigger>
            <TableColumnMenu column={column} data-analytics-id='SECURITY_COLMENU_STATUS'>
              <TableColumnMenuSortItem
                direction='asc'
                data-analytics-id='SECURITY_COLMENU_STATUS_SORT_ASC'
              />
              <TableColumnMenuSortItem
                direction='desc'
                data-analytics-id='SECURITY_COLMENU_STATUS_SORT_DESC'
              />
              <TableColumnMenuPinItem data-analytics-id='SECURITY_COLMENU_STATUS_PIN' />
              <TableColumnMenuHideItem data-analytics-id='SECURITY_COLMENU_STATUS_HIDE' />
              <TableColumnMenuMoveLeftItem data-analytics-id='SECURITY_COLMENU_STATUS_MOVE_LEFT' />
              <TableColumnMenuMoveRightItem data-analytics-id='SECURITY_COLMENU_STATUS_MOVE_RIGHT' />
            </TableColumnMenu>
          </>
        ),
        size: 130,
        enableSorting: true,
        meta: { sortType: 'text' as const, resizeType: 'cut' as const },
      }),
      securityColumnHelper.accessor('firstDetected', {
        header: ({ column }) => (
          <TableSortTrigger column={column} data-analytics-id='SECURITY_SORT_FIRST_DETECTED'>
            First detected
          </TableSortTrigger>
        ),
        size: 160,
        enableSorting: true,
        meta: { sortType: 'date' as const, resizeType: 'cut' as const },
      }),
    ],
    [track],
  );

  return (
    <Table
      data-testid='security-events-table'
      data={securityEvents}
      columns={columnsWithAnalytics}
      getRowId={row => row.id}
      // Sort: DOM seam on the icon (TableSortTrigger) + callback for direction.
      sorting={sorting}
      onSortingChange={updater => {
        setSorting(prev => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          track('SECURITY_TABLE_SORT_CHANGED', { columnId: next[0]?.id, desc: !!next[0]?.desc });
          return next;
        });
      }}
      // Selection / expand / settings menu — no DOM seam yet; callbacks carry
      // the resulting state.
      rowSelection={rowSelection}
      onRowSelectionChange={updater => {
        setRowSelection(prev => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          track('SECURITY_TABLE_SELECTION_CHANGED', { selectedIds: Object.keys(next) });
          return next;
        });
      }}
      expanded={expanded}
      onExpandedChange={updater => {
        setExpanded(prev => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          track('SECURITY_TABLE_EXPAND_CHANGED', { state: next });
          return next;
        });
      }}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={updater => {
        setColumnVisibility(prev => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          track('SECURITY_TABLE_COLUMNS_VISIBILITY_CHANGED', next);
          return next;
        });
      }}
      columnOrder={columnOrder}
      onColumnOrderChange={updater => {
        setColumnOrder(prev => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          track('SECURITY_TABLE_COLUMNS_REORDERED', { order: next });
          return next;
        });
      }}
      columnPinning={columnPinning}
      onColumnPinningChange={updater => {
        setColumnPinning(prev => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          track('SECURITY_TABLE_COLUMNS_PINNED', next);
          return next;
        });
      }}
      columnSizing={columnSizing}
      onColumnSizingChange={updater => {
        setColumnSizing(prev => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          track('SECURITY_TABLE_COLUMN_RESIZED', next);
          return next;
        });
      }}
      onMasterCellClick={rowId => track('SECURITY_TABLE_MASTER_CELL_CLICKED', { rowId })}
      renderExpandedRow={row => (
        <div className='p-16 bg-states-primary-default-alt rounded-8'>
          <HStack justify='between' align='center'>
            <VStack gap={2}>
              <Text size='xs' color='secondary'>
                Source IP
              </Text>
              <Text size='sm'>{row.original.sourceIp}</Text>
            </VStack>
            <Button
              variant='outline'
              color='neutral'
              size='small'
              data-analytics-id='SECURITY_EXPANDED_VIEW_DETAILS'
              data-analytics-props={`{"rowId":"${row.original.id}"}`}
              onClick={() =>
                track('SECURITY_EXPANDED_VIEW_DETAILS_CLICKED', { rowId: row.original.id })
              }
            >
              View full details
            </Button>
          </HStack>
        </div>
      )}
    >
      <TableActionBar>
        {/*
          Selection summary — override the default block to attach analytics to
          the "Select all" / "Clear" controls. The DS keeps the wiring (toggle /
          reset, disabled, count); the consumer onClick runs first and feeds the
          same `track` stream (call preventDefault() to skip the DS action).
        */}
        <TableActionBarSelection>
          <BulkBarSummaryCount />
          <BulkBarSummarySelectAll
            data-analytics-id='SECURITY_BULK_SELECT_ALL'
            onClick={() => track('SECURITY_BULK_SELECT_ALL_CLICKED')}
          />
          <BulkBarSummarySeparator />
          <BulkBarSummaryClear
            data-analytics-id='SECURITY_BULK_CLEAR'
            onClick={() => track('SECURITY_BULK_CLEAR_CLICKED')}
          />
        </TableActionBarSelection>

        <Button
          variant='ghost'
          color='neutral-alt'
          data-analytics-id='SECURITY_BULK_DUPLICATE'
          data-analytics-props={`{"count":${Object.keys(rowSelection).length}}`}
          onClick={() =>
            track('SECURITY_BULK_DUPLICATE_CLICKED', {
              selectedIds: Object.keys(rowSelection),
            })
          }
        >
          <Copy /> Duplicate
        </Button>
        <Button
          color='brand'
          data-analytics-id='SECURITY_BULK_DELETE'
          data-analytics-props={`{"count":${Object.keys(rowSelection).length}}`}
          onClick={() =>
            track('SECURITY_BULK_DELETE_CLICKED', {
              selectedIds: Object.keys(rowSelection),
            })
          }
        >
          <Trash2 /> Delete
        </Button>
      </TableActionBar>

      <TableScrollHandler>
        <TableScrollHandlerLeft data-analytics-id='SECURITY_SCROLL_LEFT' />
        <TableScrollHandlerRight data-analytics-id='SECURITY_SCROLL_RIGHT' />
      </TableScrollHandler>
    </Table>
  );
};

/**
 * `isLoading` with nothing to show yet: skeleton rows under a real header, so the columns do
 * not jump when the data lands.
 */
export const LoadingState: StoryFn<typeof meta> = () => (
  <Table data={[]} columns={securityColumns} isLoading />
);

/**
 * The same flag with rows already present appends the skeletons below them — this is the shape
 * for fetching the next batch, not for replacing what is on screen.
 */
export const LoadingWithData: StoryFn<typeof meta> = () => (
  <Table
    className='h-500'
    data={securityEvents}
    columns={securityColumns}
    getRowId={row => row.id}
    isLoading
  />
);

/**
 * `TableEmptyState` holding an `EmptyState` of `type='collection-empty'`: nothing exists yet,
 * so the action creates the first thing.
 */
export const EmptyCollection: StoryFn<typeof meta> = () => (
  <Table data={[]} columns={securityColumns} getRowId={row => row.id}>
    <TableEmptyState>
      <EmptyState type='collection-empty'>
        <EmptyStateIllustration>
          <Database size='lg' />
        </EmptyStateIllustration>
        <EmptyStateMessage>
          <EmptyStateTitle>No events yet</EmptyStateTitle>
          <EmptyStateDescription>
            Security events will appear here as soon as Wallarm detects traffic.
          </EmptyStateDescription>
        </EmptyStateMessage>
        <EmptyStateActions>
          <Button size='medium'>Configure source</Button>
        </EmptyStateActions>
      </EmptyState>
    </TableEmptyState>
  </Table>
);

/**
 * The other kind of empty — data exists and the filters matched none of it, so the action
 * clears the filters and is never a create.
 */
export const NoResults: StoryFn<typeof meta> = () => (
  <Table data={[]} columns={securityColumns} getRowId={row => row.id}>
    <TableEmptyState>
      <EmptyState type='no-results'>
        <EmptyStateIllustration>
          <SearchX size='lg' />
        </EmptyStateIllustration>
        <EmptyStateMessage>
          <EmptyStateTitle>No results found</EmptyStateTitle>
          <EmptyStateDescription>
            No events match your current filters. Try adjusting or resetting them.
          </EmptyStateDescription>
        </EmptyStateMessage>
        <EmptyStateActions>
          <Button size='medium' variant='outline' color='neutral'>
            <FilterX />
            Reset filters
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </TableEmptyState>
  </Table>
);

/**
 * Drag a header edge to resize. `columnSizing` is state like everything else, so a width can
 * be remembered between visits.
 */
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

/**
 * A resizable column whose cell holds an `OverflowList`: the tags re-measure as the column
 * narrows instead of being clipped by it.
 */
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

/**
 * Resizing alongside a pinned column — the pinned one holds its position while the rest of the
 * row moves underneath it.
 */
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

/**
 * `columnPinning` freezes a column to the left, so the name of the thing stays readable
 * however far sideways the table scrolls.
 */
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

/**
 * Drag a header to reorder the columns. `columnOrder` is the same state the settings menu
 * writes, so the two never disagree.
 */
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

/**
 * The per-column menu that appears on hover — sort, pin, hide, move — which is where the
 * column controls live once a header is too narrow to show them.
 */
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

/**
 * Checkboxes plus `TableActionBar`, which rises from the bottom once a row is ticked and
 * carries the verbs that apply to the whole selection.
 */
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

/**
 * A selection that outlives the table scrolling away: under `virtualized='window'` the bar is
 * pinned to the viewport rather than to the table.
 */
export const RowSelectionWindowScroll: StoryFn<typeof meta> = () => {
  const largeData = useMemo(() => createLargeSecurityEvents(100), []);
  const [rowSelection, setRowSelection] = useState<TableRowSelectionState>({});

  return (
    <>
      <Table
        data-testid='row-selection-window-scroll-table'
        data={largeData}
        columns={securityColumns}
        getRowId={row => row.id}
        virtualized='window'
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
      {/* Filler so the e2e suite can scroll the table fully out of view while a
          selection stays active — this story's only content otherwise fills
          exactly to the table's own height, so max scroll would always leave
          the table's tail in view. Generous margin over the viewport height
          (800px in the e2e config) so the anchor is unambiguously out of view
          at max scroll, not just mostly. */}
      <div style={{ height: 3000 }} />
    </>
  );
};

/**
 * `getSubRows` turns flat data into groups — each group row counts its children and collapses
 * them, keyed in the same `expanded` state a row detail uses.
 */
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

/**
 * `renderExpandedRow` draws a panel beneath the row, for the two or three fields that do not
 * deserve columns of their own.
 */
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

/**
 * Right-click inside a cell: `DropdownMenuContextTrigger` puts that column's verbs where the
 * pointer already is, so each column can offer its own.
 */
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

/**
 * The gear at the end of the header — search the columns, show and hide them, reorder them,
 * reset — writing the same visibility and order state as the header menu.
 */
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

/**
 * `virtualized='container'` inside a fixed height renders only the rows in view, which is what
 * lets a thousand rows behave like ten.
 */
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

/**
 * `virtualized='window'` measures against the page's own scroll instead, for a table that is
 * the page rather than a panel inside one.
 */
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

/**
 * The imperative escape hatch: `scrollToRow(id, { align })` off the ref, returning false for
 * an id the table does not have so a deep link can fall back.
 */
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
    <VStack gap={8}>
      <HStack gap={8}>
        <Button variant='outline' color='neutral' onClick={() => scroll(0, 'start')}>
          Top
        </Button>
        <Button variant='outline' color='neutral' onClick={() => scroll(499, 'center')}>
          Middle
        </Button>
        <Button variant='outline' color='neutral' onClick={() => scroll(999, 'end')}>
          Bottom
        </Button>
        <Button
          variant='secondary'
          color='neutral'
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

/**
 * `onEndReached` with `isLoading` — the house default for a long collection, where rows arrive
 * as you reach them and there is no page number to lose.
 */
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

/**
 * The same fetch-on-approach against the page's scroll, where the trigger has to account for
 * everything else on the page as well as the table.
 */
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

/**
 * Both ends at once: `onStartReached` prepends, and the scroll position is compensated so the
 * row you were reading does not slide out from under you.
 */
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
/**
 * The prepend case against the document scroll, where unrelated page content shares the height
 * being measured — the regression this story exists to catch.
 */
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

/**
 * A column can explain itself: `description` renders as a second line under the title, or as a
 * tooltip behind a dashed underline when the header has no room for one.
 */
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

/**
 * The first column is the master cell — pinned, and the place per-row actions appear on hover,
 * so every row keeps its verbs in one predictable spot.
 */
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

/**
 * `onMasterCellClick` with `activeRowId`: the master cell opens a `Drawer` and the row it
 * belongs to stays marked while the panel is open.
 */
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

/**
 * Grouping, expansion, selection, pinning, virtualization and the action bar in one table —
 * the honest test of whether the features cooperate rather than merely exist.
 */
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

// ---------------------------------------------------------------------------
// Inline cell editing (WDS-157)
// ---------------------------------------------------------------------------
// Table has no dedicated "editable cell" API — a column's `cell` renderer may
// return any React node. Here that node is the purpose-built `EditableCell`
// (see ./EditableCell), which owns the full body-cell box so nothing shifts
// across idle / hover / editing: the whole cell highlights grey on hover and
// draws a brand-orange border while editing (text) or open (select). The text
// editor swaps in a borderless input in place; the select cell IS the trigger,
// so its read view never gets replaced.

const statusItems: SelectDataItem[] = [
  { label: 'Blocked', value: 'Blocked' },
  { label: 'Monitoring', value: 'Monitoring' },
];

// Empty-by-default select — the placeholder text is supplied by the consumer.
const categoryItems: SelectDataItem[] = [
  { label: 'Category A', value: 'a' },
  { label: 'Category B', value: 'b' },
  { label: 'Category C', value: 'c' },
  { label: 'Category D', value: 'd' },
];

const StatusBadge: FC<{ value: SecurityEvent['status'] }> = ({ value }) => (
  <Badge
    variant='dotted'
    color={value === 'Blocked' ? 'red' : 'yellow'}
    type='secondary'
    size='medium'
  >
    {value}
  </Badge>
);

/**
 * `EditableTextCell` and `EditableSelectCell` in the plain columns, with the master column
 * deliberately read-only — editing in place suits a value the user owns, not one the system
 * reports. Hovering highlights the whole cell, clicking opens it without the content shifting,
 * and Enter or blur commits while Escape reverts.
 */
export const InlineCellEditing: StoryFn<typeof meta> = () => {
  const [data, setData] = useState<SecurityEvent[]>(() => securityEvents.slice(0, 6));
  // Category starts unselected for every row, so the select shows its placeholder.
  const [categories, setCategories] = useState<Record<string, string>>({});

  const updateCell = useCallback(
    <K extends keyof SecurityEvent>(rowId: string, key: K, value: SecurityEvent[K]) => {
      setData(prev => prev.map(row => (row.id === rowId ? { ...row, [key]: value } : row)));
    },
    [],
  );

  const columns = useMemo<TableColumnDef<SecurityEvent>[]>(
    () => [
      // The first column is the Table's pinned "master" column — keep it
      // read-only; editable cells live in the plain columns after it.
      securityColumnHelper.accessor('sourceIp', {
        header: 'Source',
        size: 200,
        meta: { resizeType: 'cut' as const },
        cell: ({ getValue }) => <Text size='sm'>{getValue()}</Text>,
      }),
      securityColumnHelper.accessor('objectName', {
        header: 'Object name',
        size: 400,
        meta: EDITABLE_CELL_COLUMN_META,
        cell: ({ row, getValue }) => (
          <EditableTextCell
            value={getValue()}
            aria-label='Edit object name'
            onCommit={value => updateCell(row.id, 'objectName', value)}
          />
        ),
      }),
      securityColumnHelper.accessor('status', {
        header: 'Status',
        size: 200,
        meta: EDITABLE_CELL_COLUMN_META,
        cell: ({ row, getValue }) => (
          <EditableSelectCell
            value={getValue()}
            items={statusItems}
            onCommit={value => updateCell(row.id, 'status', value as SecurityEvent['status'])}
          >
            <StatusBadge value={getValue()} />
          </EditableSelectCell>
        ),
      }),
      // Empty-by-default select: consumer supplies the `placeholder` text.
      securityColumnHelper.display({
        id: 'category',
        header: 'Category',
        size: 200,
        meta: EDITABLE_CELL_COLUMN_META,
        cell: ({ row }) => {
          const value = categories[row.id] ?? '';
          return (
            <EditableSelectCell
              value={value}
              items={categoryItems}
              placeholder='Select…'
              aria-label='Edit category'
              onCommit={next => setCategories(prev => ({ ...prev, [row.id]: next }))}
            >
              {categoryItems.find(item => item.value === value)?.label}
            </EditableSelectCell>
          );
        },
      }),
      securityColumnHelper.accessor('parameter', {
        header: 'Parameters',
        size: 240,
        meta: { resizeType: 'cut' as const },
        cell: ({ getValue }) => <InlineCodeSnippet code={getValue()} size='sm' copyable={false} />,
      }),
    ],
    [updateCell, categories],
  );

  return (
    <VStack gap={12} align='stretch'>
      <span className='sb-annotation'>click a cell to edit it</span>
      <Table data={data} columns={columns} getRowId={row => row.id} />
    </VStack>
  );
};
