import { useState } from 'react';
import * as z from 'zod';
import { Button } from '@wallarm-org/design-system/Button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@wallarm-org/design-system/Drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuTrigger,
} from '@wallarm-org/design-system/DropdownMenu';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Ellipsis } from '@wallarm-org/design-system/icons/Ellipsis';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from '@wallarm-org/design-system/Pagination';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import {
  createTableColumnHelper,
  Table,
  type TableColumnDef,
  type TableRowSelectionState,
  type TableSortingState,
} from '@wallarm-org/design-system/Table';
import { cn } from '@wallarm-org/design-system/utils/cn';
import { defineComponent } from '../core/define';
import {
  FieldList,
  recordField,
  renderValue,
  scalar,
  VALUE_TYPES_HELP,
  valueFormat,
  valueType,
} from '../render/cells';

type Row = Record<string, unknown>;

const column = createTableColumnHelper<Row>();

/** Numbers before strings, then the natural order; an empty cell sorts last. */
const compare = (a: unknown, b: unknown) => {
  const x = scalar(a);
  const y = scalar(b);
  if (x === undefined || x === '') return y === undefined || y === '' ? 0 : 1;
  if (y === undefined || y === '') return -1;
  if (typeof x === 'number' && typeof y === 'number') return x - y;
  return String(x).localeCompare(String(y), 'en', { numeric: true });
};

export const TableComponent = defineComponent({
  name: 'Table',
  description: `A read-only table of records: requests, events, IPs, rules. Use it when the user needs to compare rows across several fields; for a ranked top-N of one number prefer BarList. Each row is a flat object of strings and numbers keyed by the column keys; rowKey names the field that is unique per row. Column ${VALUE_TYPES_HELP} Headers sort the rows; pageSize pages them. Add detail when a row has more to say than fits in a row: clicking its first cell opens a side drawer that lists the detail fields, which may be row fields no column shows.`,
  props: z.object({
    title: z.string().optional(),
    rowKey: z.string().describe('The row field that is unique per row, e.g. "requestId"'),
    columns: z.array(
      z.object({
        key: z.string().describe('The row field this column shows'),
        header: z.string(),
        type: valueType,
        format: valueFormat,
      }),
    ),
    rows: z.array(z.looseObject({})).describe('One object per row, keyed by the column keys'),
    detail: z
      .object({
        titleKey: z
          .string()
          .optional()
          .describe('The row field the drawer is titled with. Default: the first column'),
        fields: z.array(recordField),
      })
      .optional()
      .describe("The drawer a row's first cell opens: its title and the fields it lists, in order"),
    pageSize: z.number().int().min(5).max(100).optional().describe('Rows per page; default all'),
    selectable: z
      .boolean()
      .optional()
      .describe('Checkboxes on the rows; bind selection to send the chosen rows from a Button'),
    selection: z
      .array(z.string())
      .optional()
      .describe('Bind two-way: the rowKey values of the selected rows'),
    rowActionItem: z
      .object({ label: z.string(), destructive: z.boolean().optional() })
      .optional()
      .describe(
        "One action in each row's menu (in its first cell). Choosing it writes the row's rowKey to actionRow and fires rowAction; bind actionRow and read it in the action's context",
      ),
    actionRow: z.string().optional().describe('Bind two-way: the rowKey of the row acted on'),
  }),
  events: ['rowAction'],
  bindable: ['selection', 'actionRow'],
  Skeleton: () => <Skeleton width='100%' height='240px' rounded={8} transparent={false} />,
  View: ({ props, emit, set }) => {
    const { detail, rowActionItem } = props;
    // Open row, and the row the drawer shows: it stays while the drawer animates closed.
    const [activeRowId, setActiveRowId] = useState<string | null>(null);
    const [shownRowId, setShownRowId] = useState<string | null>(null);
    const [sorting, setSorting] = useState<TableSortingState>([]);
    const [requestedPage, setRequestedPage] = useState(1);

    const menu = (rowId: string) =>
      rowActionItem && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' color='neutral' size='small' aria-label='Row actions'>
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              value='row-action'
              variant={rowActionItem.destructive ? 'destructive' : undefined}
              onSelect={() => {
                set('actionRow', rowId);
                emit('rowAction');
              }}
            >
              <DropdownMenuItemText>{rowActionItem.label}</DropdownMenuItemText>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    const columns: TableColumnDef<Row>[] = props.columns.map(
      ({ key, header, type = 'text', format }, index) =>
        column.accessor(key, {
          header: header ?? key,
          meta: {
            align: type === 'number' ? 'right' : 'left',
            // Row actions live in the master cell's menu, never in a column of their own.
            ...(index === 0 && rowActionItem ? { renderMenuAction: row => menu(row.id) } : {}),
          },
          cell: ({ row }) => renderValue(row.original[key], type, format),
        }),
    );
    // Agent rows may repeat or omit rowKey; React and TanStack need unique ids, so suffix repeats.
    const seen = new Set<string>();
    const ids = new Map<Row, string>();
    props.rows.forEach((row, index) => {
      const base = String(scalar(row[props.rowKey]) ?? `#${index}`);
      const rowId = seen.has(base) ? `${base}#${index}` : base;
      seen.add(rowId);
      ids.set(row, rowId);
    });
    const rowIds = [...ids.values()];
    const getRowId = (row: Row, index: number) => ids.get(row) ?? String(index);

    // Sorted here, before paging, so a page holds the next rows of the whole sort.
    const [sort] = sorting;
    const sorted = sort
      ? [...props.rows].sort((a, b) => compare(a[sort.id], b[sort.id]) * (sort.desc ? -1 : 1))
      : props.rows;
    const pageSize = props.pageSize ?? sorted.length;
    const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const page = Math.min(requestedPage, pages);
    const rows = props.pageSize ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

    const rowSelection: TableRowSelectionState = Object.fromEntries(
      (props.selection ?? []).filter(id => rowIds.includes(id)).map(id => [id, true]),
    );
    const onRowSelectionChange = (
      next: TableRowSelectionState | ((old: TableRowSelectionState) => TableRowSelectionState),
    ) => {
      const value = typeof next === 'function' ? next(rowSelection) : next;
      set(
        'selection',
        rowIds.filter(id => value[id]),
      );
    };

    // A row the app's data no longer has closes the drawer for good, not until it comes back:
    // the open row is reset during render, as React does for state that follows props.
    if (activeRowId !== null && !rowIds.includes(activeRowId)) setActiveRowId(null);
    const openRowId = activeRowId !== null && rowIds.includes(activeRowId) ? activeRowId : null;
    const openRow = (rowId: string) => {
      setActiveRowId(rowId === openRowId ? null : rowId);
      setShownRowId(rowId);
    };
    const onOpenChange = (open: boolean) => {
      if (!open) setActiveRowId(null);
    };
    const shown = shownRowId === null ? undefined : props.rows[rowIds.indexOf(shownRowId)];
    const titleKey = detail?.titleKey ?? props.columns[0]?.key;
    const titleColumn = props.columns.find(c => c.key === titleKey);
    const titleValue = titleKey === undefined ? undefined : scalar(shown?.[titleKey]);

    return (
      <div className={cn('flex min-w-0 flex-col gap-8')}>
        {props.title && (
          <Heading size='md' weight='medium'>
            {props.title}
          </Heading>
        )}
        <Table
          data={rows}
          columns={columns}
          getRowId={getRowId}
          aria-label={props.title}
          onMasterCellClick={detail ? openRow : undefined}
          activeRowId={detail ? openRowId : undefined}
          sorting={sorting}
          onSortingChange={setSorting}
          manualSorting
          rowSelection={props.selectable ? rowSelection : undefined}
          onRowSelectionChange={props.selectable ? onRowSelectionChange : undefined}
        />
        {props.pageSize && pages > 1 && (
          <Pagination
            count={sorted.length}
            page={page}
            pageSize={pageSize}
            onPageChange={details => setRequestedPage(details.page)}
            align='right'
            aria-label={props.title ?? 'Table pages'}
          >
            <PaginationPrevious />
            <PaginationList />
            <PaginationNext />
          </Pagination>
        )}
        {detail && (
          // Not modal: the table stays usable, and another row's first cell switches the drawer.
          <Drawer
            open={openRowId !== null}
            onOpenChange={onOpenChange}
            modal={false}
            overlay={false}
            closeOnOutsideClick={false}
            width={560}
          >
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  {titleValue === undefined || titleValue === ''
                    ? props.title || 'Details'
                    : renderValue(titleValue, titleColumn?.type, titleColumn?.format)}
                </DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <FieldList fields={detail.fields} record={shown} />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    );
  },
});
