import type { ReactNode } from 'react';
import * as z from 'zod';
import { Attribute, AttributeLabel, AttributeValue } from '@wallarm-org/design-system/Attribute';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Code } from '@wallarm-org/design-system/Code';
import {
  Country,
  type CountryCode,
  CountryFlag,
  CountryName,
} from '@wallarm-org/design-system/Country';
import {
  FormatDateTime,
  type FormatDateTimeProps,
} from '@wallarm-org/design-system/FormatDateTime';
import { HttpMethod } from '@wallarm-org/design-system/HttpMethod';
import { Ip, IpAddress } from '@wallarm-org/design-system/Ip';
import { ParameterPath } from '@wallarm-org/design-system/ParameterPath';
import { ResponseCode } from '@wallarm-org/design-system/ResponseCode';
import { VStack } from '@wallarm-org/design-system/Stack';
import { allOf, type Values } from '../core/define';
import { formatNumber, NUMBER_FORMATS, type NumberFormat } from '../core/format';

/**
 * Typed values one record field at a time: a Table cell, a row's detail drawer and a key–value
 * list draw a field the same way.
 */

export const DATE_FORMATS = allOf<Values<FormatDateTimeProps['format']>>()([
  'relative',
  'date',
  'datetime',
]);
type DateFormat = (typeof DATE_FORMATS)[number];

export const VALUE_TYPES = [
  'text',
  'number',
  'badge',
  'datetime',
  'code',
  'ip',
  'method',
  'status',
  'country',
  'parameter',
] as const;
export type ValueType = (typeof VALUE_TYPES)[number];

/** The zod for a field's `type` and `format`, with the descriptions the model reads. */
export const valueType = z.enum(VALUE_TYPES).optional().describe('Default text');
export const valueFormat = z
  .enum([...NUMBER_FORMATS, ...DATE_FORMATS])
  .optional()
  .describe(
    'number fields: number, compact, percent (0-100), bytes, ms; datetime fields: relative, date, datetime',
  );

/** What the model reads about the types, for an entry's description. */
export const VALUE_TYPES_HELP =
  'Types: datetime takes an ISO time or epoch ms, ip an IP string, method an HTTP verb, status an HTTP response code, code a short literal (path, payload, rule id), badge a short label, country an ISO 3166 alpha-2 code ("DE"), parameter a request point with its parts joined by dots ("post.json_doc.password").';

type Scalar = string | number;

/** Shaped like a code; an unknown one still renders, as the code itself and no flag. */
const isCountryCode = (value: string): value is CountryCode => /^[A-Z]{2}$/.test(value);

const isNumberFormat = (f?: string): f is NumberFormat => NUMBER_FORMATS.some(n => n === f);
const isDateFormat = (f?: string): f is DateFormat => DATE_FORMATS.some(d => d === f);

/** Agent values are untrusted: only strings and numbers render, booleans print, the rest is empty. */
export const scalar = (value: unknown): Scalar | undefined => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return String(value);
  return undefined;
};

/** One renderer per type; the Record makes a new type without a renderer fail typecheck. */
const RENDERERS: Record<ValueType, (value: Scalar, format?: string) => ReactNode> = {
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
  country: value => {
    const code = String(value).toUpperCase();
    return isCountryCode(code) ? (
      <Country code={code}>
        <CountryFlag />
        <CountryName />
      </Country>
    ) : (
      value
    );
  },
  parameter: value => <ParameterPath segments={String(value).split('.')} />,
};

/** A field's value as its type draws it; a missing or empty value is a dash. */
export const renderValue = (value: unknown, type: ValueType = 'text', format?: string) => {
  const v = scalar(value);
  return v === undefined || v === '' ? '—' : RENDERERS[type](v, format);
};

/** One line of a record's field list: which field, its label and how its value is drawn. */
export const recordField = z.object({
  key: z.string().describe('The record field this line shows'),
  label: z.string(),
  type: valueType,
  format: valueFormat,
});
export type RecordField = z.infer<typeof recordField>;

/** A record's fields as label–value lines, in order: a row's detail drawer, a KeyValueList. */
export const FieldList = ({
  fields,
  record,
}: {
  fields: readonly RecordField[];
  record: Record<string, unknown> | undefined;
}) => (
  <VStack gap={6} align='stretch'>
    {fields.map(({ key, label, type, format }, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: field keys may repeat in agent output
      <Attribute key={`${key}@${index}`} orientation='horizontal'>
        <AttributeLabel width={160}>{label}</AttributeLabel>
        <AttributeValue>{renderValue(record?.[key], type, format)}</AttributeValue>
      </Attribute>
    ))}
  </VStack>
);
