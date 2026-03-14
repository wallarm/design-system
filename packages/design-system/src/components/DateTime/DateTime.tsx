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

type DateTimeFormat = 'relative' | 'date' | 'datetime';

interface DateTimeBaseProps {
  /** ISO string, Date object, or Unix timestamp (ms) */
  value: string | Date | number | null | undefined;
  /** Display format. Default: 'relative' */
  format?: DateTimeFormat;
  /** Show seconds in tooltip absolute time. Default: true */
  showSeconds?: boolean;
  ref?: Ref<HTMLTimeElement>;
}

type DateTimeNativeProps = Omit<HTMLAttributes<HTMLTimeElement>, 'className'>;

export type DateTimeProps = DateTimeNativeProps & DateTimeBaseProps & TestableProps;

const toDate = (value: string | Date | number): Date => {
  if (value instanceof Date) return value;
  return new Date(value);
};

export const DateTime: FC<DateTimeProps> = ({
  value,
  format = 'relative',
  showSeconds = true,
  ref,
  ...props
}) => {
  // Null / undefined / invalid → em dash
  if (value == null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <time ref={ref} data-slot='datetime' {...props}>
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
      <time ref={ref} data-slot='datetime' {...props}>
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

  // Datetime: date + time in two lines
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
              {formatTimeOnly(date)}
            </Text>
          </time>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    );
  }

  // Date: absolute date
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
        </time>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
};

DateTime.displayName = 'DateTime';
