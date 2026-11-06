import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { timelineContentVariants } from './classes';

export interface TimelineContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const TimelineContent: FC<TimelineContentProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('content');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='timeline-content'
      data-testid={testId}
      className={cn(timelineContentVariants(), className)}
    >
      {children}
    </div>
  );
};

TimelineContent.displayName = 'TimelineContent';
