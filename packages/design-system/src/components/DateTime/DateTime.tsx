import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { isValid } from 'date-fns';
import { cn } from '../../utils/cn';
import {
  formatAbsoluteDate,
  formatAbsoluteTime,
  formatRelativeTime,
  formatTimeOnly,
} from '../../utils/formatDateTime';
import { Text } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

type DateTimeFormat = 'relative' | 'date' | 'datetime';

interface DateTimeBaseProps {
  /** ISO string, Date object, or Unix timestamp (ms) */
  value: string | Date | number | null | undefined;
  /** Display format. Default: 'relative' */
  format?: DateTimeFormat;
  /** Secondary text below the date */
  description?: ReactNode;
  /** Show seconds in tooltip absolute time. Default: true */
  showSeconds?: boolean;
  ref?: Ref<HTMLSpanElement>;
}

type DateTimeNativeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'className'>;

export type DateTimeProps = DateTimeNativeProps & DateTimeBaseProps;

const toDate = (value: string | Date | number): Date => {
  if (value instanceof Date) return value;
  return new Date(value);
};

export const DateTime: FC<DateTimeProps> = ({
  value,
  format = 'relative',
  description,
  showSeconds = true,
  ref,
  ...props
}) => {
  // Null / undefined / invalid → em dash
  if (value == null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span ref={ref} data-slot='datetime' {...props}>
            <Text size='sm' color='secondary'>—</Text>
          </span>
        </TooltipTrigger>
        <TooltipContent>No data</TooltipContent>
      </Tooltip>
    );
  }

  const date = toDate(value);

  if (!isValid(date)) {
    return (
      <span ref={ref} data-slot='datetime' {...props}>
        <Text size='sm' color='secondary'>—</Text>
      </span>
    );
  }

  const isoString = date.toISOString();
  const tooltipText = formatAbsoluteTime(date, { showSeconds });

  // Relative: "3 hours ago" with dashed underline
  if (format === 'relative') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <time ref={ref} dateTime={isoString} data-slot='datetime' {...props}>
            <Text size='sm'>
              <span
                className={cn(
                  'whitespace-nowrap underline decoration-dashed underline-offset-4',
                  'decoration-border-primary-light',
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

  // Datetime: date + time (or description) in two lines
  if (format === 'datetime') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <time
            ref={ref}
            dateTime={isoString}
            className='inline-flex flex-col whitespace-nowrap'
            data-slot='datetime'
            {...props}
          >
            <Text size='sm'>{formatAbsoluteDate(date)}</Text>
            <Text size='sm' color='secondary'>
              {description ?? formatTimeOnly(date)}
            </Text>
          </time>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    );
  }

  // Date: absolute date, optional description
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time
          ref={ref}
          dateTime={isoString}
          className='inline-flex flex-col whitespace-nowrap'
          data-slot='datetime'
          {...props}
        >
          <Text size='sm'>{formatAbsoluteDate(date)}</Text>
          {description && (
            <Text size='sm' color='secondary'>
              {description}
            </Text>
          )}
        </time>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
};

DateTime.displayName = 'DateTime';
