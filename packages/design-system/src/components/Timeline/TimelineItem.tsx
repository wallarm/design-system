import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { TestIdProvider, useTestId } from '../../utils/testId';
import { timelineItemVariants } from './classes';

export interface TimelineItemProps extends HTMLAttributes<HTMLLIElement> {
  ref?: Ref<HTMLLIElement>;
  children: ReactNode;
}

export const TimelineItem: FC<TimelineItemProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('item');

  return (
    <li
      data-testid={testId}
      {...props}
      ref={ref}
      data-slot='timeline-item'
      className={cn(timelineItemVariants(), className)}
    >
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </li>
  );
};

TimelineItem.displayName = 'TimelineItem';
