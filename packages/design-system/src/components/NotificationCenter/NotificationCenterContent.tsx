import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { PopoverContent, type PopoverContentProps } from '../Popover';

export type NotificationCenterContentProps = Omit<
  PopoverContentProps,
  'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight'
>;

/** The 400px panel. Header and tabs stay put; `NotificationCenterBody` scrolls. */
export const NotificationCenterContent: FC<NotificationCenterContentProps> = ({
  className,
  ...props
}) => (
  <PopoverContent
    // Labelled by NotificationCenterTitle when one is rendered (aria-labelledby wins).
    aria-label='Notifications'
    data-slot='notification-center-content'
    {...props}
    minWidth='400px'
    maxWidth='400px'
    maxHeight='640px'
    className={cn('p-0 overflow-hidden', className)}
  />
);

NotificationCenterContent.displayName = 'NotificationCenterContent';
