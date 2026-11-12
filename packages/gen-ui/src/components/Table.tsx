import type { ReactNode } from 'react';
import { z } from 'zod';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Code } from '@wallarm-org/design-system/Code';
import {
  FormatDateTime,
  type FormatDateTimeProps,
} from '@wallarm-org/design-system/FormatDateTime';
import { Heading } from '@wallarm-org/design-system/Heading';
import { HttpMethod } from '@wallarm-org/design-system/HttpMethod';
import { Ip, IpAddress } from '@wallarm-org/design-system/Ip';
import { ResponseCode } from '@wallarm-org/design-system/ResponseCode';
import {
  createTableColumnHelper,
  Table,
  type TableColumnDef,
} from '@wallarm-org/design-system/Table';
import { cn } from '@wallarm-org/design-system/utils/cn';
import { allOf, defineComponent, type Values } from '../define';
import { formatNumber, NUMBER_FORMATS, type NumberFormat } from '../format';

const DATE_FORMATS = allOf<Values<FormatDateTimeProps['format']>>()([
  'relative',
  'date',
  'datetime',
]);
type DateFormat = (typeof DATE_FORMATS)[number];

const CELL_TYPES = [
  'text',
  'number',
  'badge',
  'datetime',
  'code',
  'ip',
  'method',
  'status',
] as const;
type CellType = (typeof CELL_TYPES)[number];

type Scalar = string | number;
type Row = Record<string, unknown>;

const isNumberFormat = (f?: string): f is NumberFormat => NUMBER_FORMATS.some(n => n === f);
const isDateFormat = (f?: string): f is DateFormat => DATE_FORMATS.some(d => d === f);

/** Agent rows are untrusted: only strings and numbers render, booleans print, the rest is empty. */
const scalar = (value: unknown): Scalar | undefined => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return String(value);
  return undefined;
};

/** One renderer per cell type; the Record makes a new type without a renderer fail typecheck. */
const CELLS: Record<CellType, (value: Scalar, format?: string) => ReactNode> = {
  text: value => value,
  number: (value, format) =>
    typeof value === 'number'
      ? formatNumber(value, isNumberFormat(format) ? format : 'number')
      : value,
  badge: value => (
    <Badge type='secondary' color='slate'>
      {value}
    </Badge>
  ),
  datetime: (value, format) => (
    <FormatDateTime
      value={value}
      format={isDateFormat(format) ? format : 'datetime'}
      layout='inline'
    />
  ),
  code: value => (
    <Code size='s' truncate>
      {value}
    </Code>
  ),
  ip: value => (
    <Ip>
      <IpAddress>{value}</IpAddress>
    </Ip>
  ),
  method: value => <HttpMethod method={String(value)} />,
  status: value => <ResponseCode code={value} />,
};

const column = createTableColumnHelper<Row>();

export const TableComponent = defineComponent({
  name: 'Table',
  description:
    'A read-only table of records: requests, events, IPs, rules. Use it when the user needs to compare rows across several fields; for a ranked top-N of one number prefer BarList. Each row is a flat object of strings and numbers keyed by the column keys; rowKey names the field that is unique per row. Column types: datetime takes an ISO time or epoch ms, ip an IP string, method an HTTP verb, status an HTTP response code, code a short literal (path, payload, rule id), badge a short label. Send rows in display order: there is no sorting, paging or selection.',
  props: z.object({
    title: z.string().optional(),
    rowKey: z.string().describe('The row field that is unique per row, e.g. "requestId"'),
    columns: z.array(
      z.object({
        key: z.string().describe('The row field this column shows'),
        header: z.string(),
        type: z.enum(CELL_TYPES).optional().describe('Default text'),
        format: z
          .enum([...NUMBER_FORMATS, ...DATE_FORMATS])
          .optional()
          .describe(
            'number columns: number, compact, percent (0-100), bytes, ms; datetime columns: relative, date, datetime',
          ),
      }),
    ),
    rows: z.array(z.looseObject({})).describe('One object per row, keyed by the column keys'),
  }),
  View: ({ props }) => {
    // A binding resolves to undefined until its data arrives; a streamed column may lack its key.
    const columns: TableColumnDef<Row>[] = (props.columns ?? [])
      .filter(c => c?.key)
      .map(({ key, header, type = 'text', format }) =>
        column.accessor(key, {
          header: header ?? key,
          meta: { align: type === 'number' ? 'right' : 'left' },
          cell: ({ row }) => {
            const value = scalar(row.original[key]);
            return value === undefined || value === '' ? '—' : CELLS[type](value, format);
          },
        }),
      );
    const rows = props.rows ?? [];
    // Agent rows may repeat or omit rowKey; React and TanStack need unique ids, so suffix repeats.
    const seen = new Set<string>();
    const rowIds = rows.map((row, index) => {
      const base = String(scalar(row?.[props.rowKey]) ?? `#${index}`);
      const rowId = seen.has(base) ? `${base}#${index}` : base;
      seen.add(rowId);
      return rowId;
    });
    const getRowId = (_row: Row, index: number) => rowIds[index] ?? String(index);

    return (
      <div className={cn('flex min-w-0 flex-col gap-8')}>
        {props.title && (
          <Heading size='md' weight='medium'>
            {props.title}
          </Heading>
        )}
        <Table data={rows} columns={columns} getRowId={getRowId} aria-label={props.title} />
      </div>
    );
  },
});
