import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { EmptyState, type EmptyStateProps } from '../EmptyState';
import {
  ScrollArea,
  ScrollAreaContent,
  type ScrollAreaProps,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';
import { Skeleton } from '../Skeleton';
import { useNotificationCenterContext } from './NotificationCenter';

export type NotificationCenterBodyProps = Omit<ScrollAreaProps, 'children'> & {
  children: ReactNode;
};

/** The scrolling area under the header (or tabs). Holds a list, an empty state or a skeleton. */
export const NotificationCenterBody: FC<NotificationCenterBodyProps> = ({
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { testId: rootTestId } = useNotificationCenterContext();
  const testId = useTestId('body', testIdProp ?? (rootTestId && `${rootTestId}--body`));

  return (
    <ScrollArea
      {...props}
      data-slot='notification-center-body'
      data-testid={testId}
      className={cn(
        // The popover only has a max-height, so a percentage height on the viewport never resolves:
        // make the viewport a flex item instead so it shrinks to the body and scrolls.
        'flex min-h-0 flex-1 flex-col [&>[data-part=viewport]]:min-h-0 [&>[data-part=viewport]]:flex-1',
        className,
      )}
    >
      <ScrollAreaViewport>
        {/* zag sets an inline `min-width: fit-content`; the panel is fixed-width, so long text wraps instead. */}
        <ScrollAreaContent className='h-auto min-w-0! px-12 pt-4 pb-16'>
          {/* List, items, empty and skeleton derive from the root id (`nc--item`), not the tabs' (`nc--tabs--…`). */}
          <TestIdProvider value={rootTestId}>{children}</TestIdProvider>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar />
    </ScrollArea>
  );
};

NotificationCenterBody.displayName = 'NotificationCenterBody';

export type NotificationCenterEmptyProps = Omit<EmptyStateProps, 'type'>;

/** Empty (and error) state for a body. Compose it from `EmptyState` parts. */
export const NotificationCenterEmpty: FC<NotificationCenterEmptyProps> = ({
  className,
  'data-testid': testIdProp,
  ...props
}) => (
  <EmptyState
    {...props}
    type='collection-empty'
    data-testid={useTestId('empty', testIdProp)}
    className={cn('pt-24 pb-40', className)}
  />
);

NotificationCenterEmpty.displayName = 'NotificationCenterEmpty';

export interface NotificationCenterSkeletonProps
  extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Number of placeholder rows. */
  rows?: number;
}

export const NotificationCenterSkeleton: FC<NotificationCenterSkeletonProps> = ({
  ref,
  rows = 4,
  className,
  'data-testid': testIdProp,
  ...props
}) => (
  <div
    aria-busy
    {...props}
    ref={ref}
    data-slot='notification-center-skeleton'
    data-testid={useTestId('skeleton', testIdProp)}
    className={cn('flex flex-col gap-4', className)}
  >
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className='flex flex-col gap-2 p-6'>
        <div className='flex items-center justify-between gap-8'>
          <Skeleton width='60%' height='14px' rounded={4} />
          <Skeleton width='32px' height='12px' rounded={4} />
        </div>
        <Skeleton width='90%' height='12px' rounded={4} />
      </div>
    ))}
  </div>
);

NotificationCenterSkeleton.displayName = 'NotificationCenterSkeleton';
