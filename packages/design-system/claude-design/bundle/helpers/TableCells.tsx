import type { ReactNode } from 'react';
import { Badge, type BadgeColor } from '../../../src/components/Badge';
import { FormatDateTime } from '../../../src/components/FormatDateTime';
import { HttpMethod } from '../../../src/components/HttpMethod';
import { Ip, IpAddress } from '../../../src/components/Ip';
import { ResponseCode } from '../../../src/components/ResponseCode';
import { Tag } from '../../../src/components/Tag';
import { Text } from '../../../src/components/Text';

/** Structural subset accepted by the design system's Table cell contract. */
export type TableCellRenderer = (context: { getValue: () => unknown }) => ReactNode;

const severityColors: Record<string, BadgeColor> = {
  critical: 'red',
  high: 'w-orange',
  medium: 'amber',
  low: 'blue',
  info: 'slate',
  informational: 'slate',
};

const isTextValue = (value: unknown): value is string | number =>
  typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));

const emptyCell = () => (
  <Text size='sm' color='secondary'>
    —
  </Text>
);

/** No-argument factories usable directly as a column's `cell` renderer. */
export const TableCells = {
  severity:
    (): TableCellRenderer =>
    ({ getValue }) => {
      const value = getValue();
      if (typeof value !== 'string' || !value.trim()) return emptyCell();
      const severity = value.trim().toLowerCase();
      const color = Object.hasOwn(severityColors, severity) ? severityColors[severity] : 'slate';
      return (
        <Badge type='secondary' color={color}>
          {value}
        </Badge>
      );
    },
  httpMethod:
    (): TableCellRenderer =>
    ({ getValue }) => {
      const value = getValue();
      return typeof value === 'string' && value.trim() ? (
        <HttpMethod method={value} />
      ) : (
        emptyCell()
      );
    },
  responseCode:
    (): TableCellRenderer =>
    ({ getValue }) => {
      const value = getValue();
      return isTextValue(value) && value !== '' ? <ResponseCode code={value} /> : emptyCell();
    },
  ip:
    (): TableCellRenderer =>
    ({ getValue }) => {
      const value = getValue();
      return typeof value === 'string' && value.trim() ? (
        <Ip>
          <IpAddress>{value}</IpAddress>
        </Ip>
      ) : (
        emptyCell()
      );
    },
  dateTime:
    (): TableCellRenderer =>
    ({ getValue }) => {
      const value = getValue();
      return isTextValue(value) || value instanceof Date ? (
        <FormatDateTime value={value} format='datetime' />
      ) : (
        emptyCell()
      );
    },
  tags:
    (): TableCellRenderer =>
    ({ getValue }) => {
      const value = getValue();
      const tags = Array.isArray(value)
        ? value.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
        : [];
      if (tags.length === 0) return emptyCell();
      const occurrences = new Map<string, number>();
      return (
        <div className='flex flex-wrap items-center gap-4'>
          {tags.map(tag => {
            const occurrence = (occurrences.get(tag) ?? 0) + 1;
            occurrences.set(tag, occurrence);
            return <Tag key={`${tag}:${occurrence}`}>{tag}</Tag>;
          })}
        </div>
      );
    },
  text:
    (): TableCellRenderer =>
    ({ getValue }) => {
      const value = getValue();
      return isTextValue(value) || typeof value === 'boolean' ? (
        <Text size='sm'>{String(value)}</Text>
      ) : (
        emptyCell()
      );
    },
};
