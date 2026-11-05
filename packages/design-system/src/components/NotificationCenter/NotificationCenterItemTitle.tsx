import type { ButtonHTMLAttributes, FC, MouseEvent, Ref } from 'react';
import { usePopoverContext } from '@ark-ui/react/popover';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useNotificationCenterItemUnread } from './NotificationCenterItem';

export interface NotificationCenterItemTitleProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /** Render your own element, e.g. a router link or `<a href>`. */
  asChild?: boolean;
  /** Close the popover after `onClick`. Call `event.preventDefault()` to keep it open once. */
  closeOnClick?: boolean;
}

/**
 * The item's main click target. Its hit area stretches over the whole card,
 * so a click anywhere on the item (except its actions) lands on this element.
 */
export const NotificationCenterItemTitle: FC<NotificationCenterItemTitleProps> = ({
  ref,
  asChild = false,
  closeOnClick = true,
  className,
  children,
  onClick,
  'data-testid': testIdProp,
  ...props
}) => {
  const unread = useNotificationCenterItemUnread();
  const { setOpen } = usePopoverContext();
  const testId = useTestId('title', testIdProp);
  const Comp = asChild ? Slot : 'button';

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (closeOnClick && !event.defaultPrevented) setOpen(false);
  };

  return (
    <Comp
      type={asChild ? undefined : 'button'}
      {...props}
      ref={ref}
      onClick={handleClick}
      data-slot='notification-center-item-title'
      data-testid={testId}
      className={cn(
        'cursor-pointer text-left font-sans-display text-sm font-medium break-words text-text-primary outline-none',
        'after:absolute after:inset-0 after:rounded-8',
        'focus-visible:after:ring-3 focus-visible:after:ring-focus-primary',
        className,
      )}
    >
      {unread && (
        <>
          <span className='sr-only'>Unread,</span>{' '}
        </>
      )}
      <Slottable>{children}</Slottable>
    </Comp>
  );
};

NotificationCenterItemTitle.displayName = 'NotificationCenterItemTitle';
