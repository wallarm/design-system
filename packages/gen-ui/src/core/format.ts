import * as z from 'zod';

/**
 * Named formats instead of formatter functions: a spec is data, so a chart axis or a table cell
 * says `'percent'` and the View formats it. One registry for Metric, the charts and Table.
 */
export const NUMBER_FORMATS = ['number', 'compact', 'percent', 'bytes', 'ms'] as const;
export const TIME_FORMATS = ['time', 'date', 'datetime'] as const;

export type NumberFormat = (typeof NUMBER_FORMATS)[number];
export type TimeFormat = (typeof TIME_FORMATS)[number];

export const numberFormat = z
  .enum(NUMBER_FORMATS)
  .optional()
  .describe(
    'number 1,240 · compact 1.2K · percent 42% (value is 0-100) · bytes 1.2 MB · ms 340 ms',
  );
export const timeFormat = z
  .enum(TIME_FORMATS)
  .optional()
  .describe('How to print ISO timestamps: time 14:05 · date 5 Nov · datetime 5 Nov, 14:05');

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export const formatNumber = (value: number, format: NumberFormat = 'number'): string => {
  switch (format) {
    case 'compact':
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value);
    case 'percent':
      return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)}%`;
    case 'bytes': {
      let unit = 0;
      let n = Math.abs(value);
      while (n >= 1024 && unit < BYTE_UNITS.length - 1) {
        n /= 1024;
        unit++;
      }
      return `${Math.sign(value) < 0 ? '-' : ''}${n.toFixed(unit && n < 10 ? 1 : 0)} ${BYTE_UNITS[unit]}`;
    }
    case 'ms':
      return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} ms`;
    default:
      return value.toLocaleString('en-US');
  }
};

const TIME_OPTIONS: Record<TimeFormat, Intl.DateTimeFormatOptions> = {
  time: { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
  date: { day: 'numeric', month: 'short' },
  datetime: {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  },
};

/** An ISO string or epoch ms; an unparseable value is printed as is. */
export const formatTime = (value: string | number, format: TimeFormat = 'datetime'): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat('en-GB', TIME_OPTIONS[format]).format(date);
};
