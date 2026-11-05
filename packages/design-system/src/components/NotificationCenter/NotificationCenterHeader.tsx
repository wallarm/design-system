import { Children, type FC, Fragment, type HTMLAttributes, type Ref } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { Separator } from '../Separator';

export interface NotificationCenterHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
}

export const NotificationCenterHeader: FC<NotificationCenterHeaderProps> = ({
  ref,
  className,
  'data-testid': testIdProp,
  ...props
}) => (
  <div
    {...props}
    ref={ref}
    data-slot='notification-center-header'
    data-testid={useTestId('header', testIdProp)}
    className={cn('flex items-center justify-between gap-8 px-12 pt-12', className)}
  />
);

NotificationCenterHeader.displayName = 'NotificationCenterHeader';

export interface NotificationCenterTitleProps
  extends HTMLAttributes<HTMLHeadingElement>,
    TestableProps {
  ref?: Ref<HTMLHeadingElement>;
}

/** An `<h2>` that labels the popover. Defaults to "Notifications". */
export const NotificationCenterTitle: FC<NotificationCenterTitleProps> = ({
  ref,
  className,
  children = 'Notifications',
  'data-testid': testIdProp,
  ...props
}) => (
  <ArkUiPopover.Title asChild>
    <h2
      {...props}
      ref={ref}
      data-slot='notification-center-title'
      data-testid={useTestId('title', testIdProp)}
      className={cn('font-sans-display text-md font-medium text-text-primary', className)}
    >
      {children}
    </h2>
  </ArkUiPopover.Title>
);

NotificationCenterTitle.displayName = 'NotificationCenterTitle';

export interface NotificationCenterHeaderActionsProps
  extends HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/** Lays out header actions with a vertical separator between each pair. */
export const NotificationCenterHeaderActions: FC<NotificationCenterHeaderActionsProps> = ({
  ref,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => (
  <div
    {...props}
    ref={ref}
    data-slot='notification-center-header-actions'
    data-testid={useTestId('header-actions', testIdProp)}
    className={cn('flex items-center gap-4', className)}
  >
    {Children.toArray(children).map((child, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: children keep their order; Children.toArray keys the child itself
      <Fragment key={index}>
        {index > 0 && <Separator orientation='vertical' />}
        {child}
      </Fragment>
    ))}
  </div>
);

NotificationCenterHeaderActions.displayName = 'NotificationCenterHeaderActions';

export type NotificationCenterHeaderActionProps = Omit<ButtonProps, 'variant' | 'color' | 'size'>;

/** A ghost header button: "Mark all as read", or the settings link via `asChild`. */
export const NotificationCenterHeaderAction: FC<NotificationCenterHeaderActionProps> = ({
  'data-testid': testIdProp,
  ...props
}) => (
  <Button
    data-slot='notification-center-header-action'
    {...props}
    data-testid={useTestId('header-action', testIdProp)}
    variant='ghost'
    color='neutral'
    size='small'
  />
);

NotificationCenterHeaderAction.displayName = 'NotificationCenterHeaderAction';
