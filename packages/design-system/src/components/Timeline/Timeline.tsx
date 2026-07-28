import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { timelineVariants } from './classes';

export interface TimelineProps extends HTMLAttributes<HTMLOListElement>, TestableProps {
  ref?: Ref<HTMLOListElement>;
  children: ReactNode;
}

export const Timeline: FC<TimelineProps> = ({
  ref,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  return (
    <ol
      {...props}
      ref={ref}
      data-slot='timeline'
      data-testid={testId}
      className={cn(timelineVariants(), className)}
    >
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </ol>
  );
};

Timeline.displayName = 'Timeline';
