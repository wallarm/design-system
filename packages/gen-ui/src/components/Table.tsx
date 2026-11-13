import { useState } from 'react';
import * as z from 'zod';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@wallarm-org/design-system/Drawer';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import {
  createTableColumnHelper,
  Table,
  type TableColumnDef,
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

export const TableComponent = defineComponent({
  name: 'Table',
  description: `A read-only table of records: requests, events, IPs, rules. Use it when the user needs to compare rows across several fields; for a ranked top-N of one number prefer BarList. Each row is a flat object of strings and numbers keyed by the column keys; rowKey names the field that is unique per row. Column ${VALUE_TYPES_HELP} Send rows in display order: there is no sorting, paging or selection. Add detail when a row has more to say than fits in a row: clicking its first cell opens a side drawer that lists the detail fields, which may be row fields no column shows.`,
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
  }),
  Skeleton: () => <Skeleton width='100%' height='240px' rounded={8} transparent={false} />,
  View: ({ props }) => {
    const { rows, detail } = props;
    // Open row, and the row the drawer shows: it stays while the drawer animates closed.
    const [activeRowId, setActiveRowId] = useState<string | null>(null);
    const [shownRowId, setShownRowId] = useState<string | null>(null);

    const columns: TableColumnDef<Row>[] = props.columns.map(
      ({ key, header, type = 'text', format }) =>
        column.accessor(key, {
          header: header ?? key,
          meta: { align: type === 'number' ? 'right' : 'left' },
          cell: ({ row }) => renderValue(row.original[key], type, format),
        }),
    );
    // Agent rows may repeat or omit rowKey; React and TanStack need unique ids, so suffix repeats.
    const seen = new Set<string>();
    const rowIds = rows.map((row, index) => {
      const base = String(scalar(row[props.rowKey]) ?? `#${index}`);
      const rowId = seen.has(base) ? `${base}#${index}` : base;
      seen.add(rowId);
      return rowId;
    });
    const getRowId = (_row: Row, index: number) => rowIds[index] ?? String(index);

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
    const shown = shownRowId === null ? undefined : rows[rowIds.indexOf(shownRowId)];
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
        />
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
