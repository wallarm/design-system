import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Bell } from '../../icons';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { NumericBadge } from '../NumericBadge';
import { PopoverTrigger } from '../Popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useNotificationCenterContext } from './NotificationCenter';

export interface NotificationCenterTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'children'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /** Unread count. `0` hides the badge; above 99 the badge shows `99+`. */
  count?: number;
  /** Tooltip text and the base of the accessible name. */
  label?: string;
  /** Replaces the bell icon. */
  children?: ReactNode;
}

const MAX_BADGE_COUNT = 99;

/** The bell button: icon, unread badge, tooltip and accessible name. */
export const NotificationCenterTrigger: FC<NotificationCenterTriggerProps> = ({
  ref,
  count = 0,
  label = 'Notifications',
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { triggerId } = useNotificationCenterContext();
  const testId = useTestId('trigger', testIdProp);

  return (
    // Scope the tooltip to the bell, or its content would inherit the root id and clash with `--content`.
    <Tooltip ids={{ trigger: triggerId }} data-testid={testId}>
      <PopoverTrigger asChild data-testid={testId}>
        <TooltipTrigger asChild data-testid={testId}>
          <Button
            aria-label={count > 0 ? `${label}, ${count} unread` : label}
            data-slot='notification-center-trigger'
            {...props}
            ref={ref}
            variant='ghost'
            color='neutral'
            size='small'
          >
            {children ?? <Bell />}
            {count > 0 && (
              <NumericBadge type='solid' color='brand' size='small' aria-hidden>
                {count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : count}
              </NumericBadge>
            )}
          </Button>
        </TooltipTrigger>
      </PopoverTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

NotificationCenterTrigger.displayName = 'NotificationCenterTrigger';
