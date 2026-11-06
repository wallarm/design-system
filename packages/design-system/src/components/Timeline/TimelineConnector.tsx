import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { timelineConnectorVariants } from './classes';

export interface TimelineConnectorProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const TimelineConnector: FC<TimelineConnectorProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('connector');

  return (
    <div
      data-testid={testId}
      {...props}
      ref={ref}
      data-slot='timeline-connector'
      className={cn(timelineConnectorVariants(), className)}
    >
      {children}
    </div>
  );
};

TimelineConnector.displayName = 'TimelineConnector';
