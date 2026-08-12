import type { FC, HTMLAttributes, Ref } from 'react';
import { isValid } from 'date-fns';
import { cn } from '../../utils/cn';
import {
  formatAbsoluteDate,
  formatAbsoluteTime,
  formatRelativeTime,
  formatTimeOnly,
} from '../../utils/formatDateTime';
import type { TestableProps } from '../../utils/testId';
import { Text } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

type FormatDateTimeFormat = 'relative' | 'date' | 'datetime';

type FormatDateTimeLayout = 'stacked' | 'inline';

interface FormatDateTimeBaseProps {
  /** ISO string, Date object, or Unix timestamp (ms) */
  value: string | Date | number | null | undefined;
  /** Display format. Default: 'relative' */
  format?: FormatDateTimeFormat;
  /**
   * Datetime layout. `stacked` puts date over time; `inline` puts them on one
   * line. Only affects `format='datetime'`. Default: 'stacked'
   */
  layout?: FormatDateTimeLayout;
  /** Show seconds in the relative-format tooltip. Default: true */
  showSeconds?: boolean;
  ref?: Ref<HTMLTimeElement>;
}

type FormatDateTimeNativeProps = Omit<HTMLAttributes<HTMLTimeElement>, 'className'>;

export type FormatDateTimeProps = FormatDateTimeNativeProps &
  FormatDateTimeBaseProps &
  TestableProps;

const toDate = (value: string | Date | number): Date => {
  if (value instanceof Date) return value;
  return new Date(value);
};

export const FormatDateTime: FC<FormatDateTimeProps> = ({
  value,
  format = 'relative',
  layout = 'stacked',
  showSeconds = true,
  ref,
  ...props
}) => {
  // Null / undefined / invalid → em dash
  if (value == null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <time ref={ref} data-slot='format-date-time' {...props}>
            <Text size='sm' color='secondary'>
              —
            </Text>
          </time>
        </TooltipTrigger>
        <TooltipContent>No data</TooltipContent>
      </Tooltip>
    );
  }

  const date = toDate(value);

  if (!isValid(date)) {
    return (
      <time ref={ref} data-slot='format-date-time' {...props}>
        <Text size='sm' color='secondary'>
          —
        </Text>
      </time>
    );
  }

  const isoString = date.toISOString();
  const tooltipText = formatAbsoluteTime(date, { showSeconds });

  // Relative: "3 hours ago" with dashed underline
  if (format === 'relative') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <time ref={ref} dateTime={isoString} data-slot='format-date-time' {...props}>
            <Text size='sm'>
              <span
                className={cn(
                  'whitespace-nowrap border-b-1 border-dashed border-border-strong-primary',
                )}
              >
                {formatRelativeTime(date)}
              </span>
            </Text>
          </time>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    );
  }

  // Datetime: date + time, stacked (two lines) or inline (one line).
  // No tooltip — the value already shows date + time + timezone in full.
  if (format === 'datetime') {
    return (
      <time
        ref={ref}
        dateTime={isoString}
        className={cn(
          'inline-flex whitespace-nowrap',
          layout === 'inline' ? 'items-baseline gap-4' : 'flex-col',
        )}
        data-slot='format-date-time'
        {...props}
      >
        <Text size='sm'>{formatAbsoluteDate(date)}</Text>
        <Text size='sm' color='secondary'>
          {formatTimeOnly(date)}
        </Text>
      </time>
    );
  }

  // Date: absolute date. No tooltip — the value is already self-explanatory.
  return (
    <time
      ref={ref}
      dateTime={isoString}
      className='inline-flex flex-col whitespace-nowrap'
      data-slot='format-date-time'
      {...props}
    >
      <Text size='sm'>{formatAbsoluteDate(date)}</Text>
    </time>
  );
};

FormatDateTime.displayName = 'FormatDateTime';
