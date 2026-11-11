import { createContext, type FC, type HTMLAttributes, type Ref, useContext } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';

export interface NotificationCenterListProps
  extends HTMLAttributes<HTMLUListElement>, TestableProps {
  ref?: Ref<HTMLUListElement>;
}

export const NotificationCenterList: FC<NotificationCenterListProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => (
  <ul
    {...props}
    ref={ref}
    data-slot='notification-center-list'
    data-testid={useTestId('list', testIdProp)}
    className={cn('flex flex-col gap-4', className)}
  />
);

NotificationCenterList.displayName = 'NotificationCenterList';

/** The item's `unread` flag, read by its title (screen-reader prefix) and time (dot). */
const NotificationCenterItemContext = createContext(false);

export const useNotificationCenterItemUnread = () => useContext(NotificationCenterItemContext);

export interface NotificationCenterItemProps extends HTMLAttributes<HTMLLIElement>, TestableProps {
  ref?: Ref<HTMLLIElement>;
  /** Shows the unread dot and prefixes the title's accessible name with "Unread". */
  unread?: boolean;
}

/**
 * One notification. `NotificationCenterItemTitle` is the card's click target;
 * actions sit above it as separate buttons.
 */
export const NotificationCenterItem: FC<NotificationCenterItemProps> = ({
  ref,
  unread = false,
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('item', testIdProp);

  return (
    <NotificationCenterItemContext.Provider value={unread}>
      <TestIdProvider value={testId}>
        <li
          {...props}
          ref={ref}
          data-slot='notification-center-item'
          data-testid={testId}
          data-unread={unread || undefined}
          className={cn(
            'relative grid grid-cols-[1fr_auto] items-start gap-x-8 gap-y-4 rounded-8 p-8',
            'overlay hover:overlay-states-primary-hover',
            className,
          )}
        />
      </TestIdProvider>
    </NotificationCenterItemContext.Provider>
  );
};

NotificationCenterItem.displayName = 'NotificationCenterItem';

export interface NotificationCenterItemDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement>, TestableProps {
  ref?: Ref<HTMLParagraphElement>;
}

export const NotificationCenterItemDescription: FC<NotificationCenterItemDescriptionProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => (
  <p
    {...props}
    ref={ref}
    data-slot='notification-center-item-description'
    data-testid={useTestId('description', testIdProp)}
    className={cn(
      'col-span-2 font-sans-display text-sm break-words text-text-secondary',
      className,
    )}
  />
);

NotificationCenterItemDescription.displayName = 'NotificationCenterItemDescription';

export interface NotificationCenterItemActionsProps
  extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/** Holds the item's buttons. They sit above the title's card-wide click area. */
export const NotificationCenterItemActions: FC<NotificationCenterItemActionsProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => (
  <div
    {...props}
    ref={ref}
    data-slot='notification-center-item-actions'
    data-testid={useTestId('actions', testIdProp)}
    className={cn('relative z-1 col-span-2 flex items-center gap-4 pt-6', className)}
  />
);

NotificationCenterItemActions.displayName = 'NotificationCenterItemActions';
