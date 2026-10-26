import type { FC, HTMLAttributes, Ref } from 'react';
import { isValid } from 'date-fns';
import { cn } from '../../utils/cn';
import { formatAbsoluteTime, formatCompactRelativeTime } from '../../utils/formatDateTime';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useDateFormat } from '../DateFormatProvider/useDateFormat';
import { Indicator } from '../Indicator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useNotificationCenterItemUnread } from './NotificationCenterItem';

export interface NotificationCenterItemTimeProps
  extends Omit<HTMLAttributes<HTMLTimeElement>, 'children'>, TestableProps {
  ref?: Ref<HTMLTimeElement>;
  /** ISO string, Date or Unix timestamp (ms). */
  value: string | Date | number;
}

/** Compact age ("3m", "2h") with the unread dot; the exact time is in a tooltip. */
export const NotificationCenterItemTime: FC<NotificationCenterItemTimeProps> = ({
  ref,
  value,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const unread = useNotificationCenterItemUnread();
  const dateFormat = useDateFormat();
  const testId = useTestId('time', testIdProp);
  const date = value instanceof Date ? value : new Date(value);
  const valid = isValid(date);

  return (
    <Tooltip disabled={!valid} data-testid={testId}>
      <TooltipTrigger asChild data-testid={testId}>
        <time
          {...props}
          ref={ref}
          dateTime={valid ? date.toISOString() : undefined}
          data-slot='notification-center-item-time'
          className={cn(
            'relative z-1 flex items-center gap-4 font-sans-display text-xs whitespace-nowrap text-text-secondary',
            className,
          )}
        >
          {unread && <Indicator aria-hidden size='sm' color='info' />}
          {formatCompactRelativeTime(date, undefined, dateFormat)}
        </time>
      </TooltipTrigger>
      <TooltipContent>{valid && formatAbsoluteTime(date, dateFormat)}</TooltipContent>
    </Tooltip>
  );
};

NotificationCenterItemTime.displayName = 'NotificationCenterItemTime';
