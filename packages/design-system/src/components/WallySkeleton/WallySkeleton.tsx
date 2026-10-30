import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import {
  Chat,
  ChatBody,
  ChatFooter,
  ChatHeader,
  ChatHeaderActions,
  ChatHeaderTitle,
} from '../Chat';
import { Skeleton } from '../Skeleton';

export interface WallySkeletonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Shared loading surface for the host, remote and assistant runtime. Give its parent a height.
 * The placeholders and mesh stay static so replacing one loading stage with another cannot
 * restart an animation and flash. This non-interactive surface exposes one loading status.
 */
export const WallySkeleton: FC<WallySkeletonProps> = ({
  ref,
  className,
  'data-testid': testId,
  ...props
}) => (
  <div
    role='status'
    aria-label='Loading Wally'
    aria-busy='true'
    {...props}
    ref={ref}
    data-slot='wally-skeleton'
    data-testid={testId}
    className={cn('h-full min-h-0 w-full min-w-0 flex-1', className)}
  >
    <Chat
      background='strong'
      aria-hidden='true'
      data-testid={testId && `${testId}--chat`}
      className='[&_*]:animate-none! [&_[data-slot=skeleton]]:bg-bg-primary'
    >
      <ChatHeader>
        <ChatHeaderTitle>
          <Skeleton width='96px' height='16px' />
        </ChatHeaderTitle>
        <ChatHeaderActions>
          <Skeleton width='28px' height='28px' />
          <Skeleton width='28px' height='28px' />
          <Skeleton width='28px' height='28px' />
        </ChatHeaderActions>
      </ChatHeader>
      <ChatBody>
        <div className='flex flex-col items-center gap-24 pt-103'>
          <div className='flex w-full flex-col items-center gap-12'>
            <Skeleton width='64px' height='64px' rounded='full' />
            <Skeleton className='max-w-[90%]' width='280px' height='24px' />
          </div>
          <div className='flex w-full flex-col items-center gap-12'>
            <Skeleton className='max-w-[85%]' width='240px' height='28px' rounded={12} />
            <Skeleton className='max-w-[95%]' width='280px' height='28px' rounded={12} />
            <Skeleton className='max-w-[80%]' width='220px' height='28px' rounded={12} />
          </div>
        </div>
      </ChatBody>
      <ChatFooter>
        <Skeleton width='100%' height='92px' rounded={16} />
        <div className='flex justify-center pb-8'>
          <Skeleton className='max-w-[90%]' width='240px' height='12px' />
        </div>
      </ChatFooter>
    </Chat>
  </div>
);

WallySkeleton.displayName = 'WallySkeleton';
