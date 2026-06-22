import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface EmptyStateMessageProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const EmptyStateMessage: FC<EmptyStateMessageProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('message');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='empty-state-message'
      data-testid={testId}
      className={cn('flex flex-col items-center gap-8', className)}
    >
      {children}
    </div>
  );
};

EmptyStateMessage.displayName = 'EmptyStateMessage';
