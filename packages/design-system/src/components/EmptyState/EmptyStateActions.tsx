import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface EmptyStateActionsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const EmptyStateActions: FC<EmptyStateActionsProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('actions');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='empty-state-actions'
      data-testid={testId}
      className={cn('flex items-center justify-center gap-12', className)}
    >
      {children}
    </div>
  );
};

EmptyStateActions.displayName = 'EmptyStateActions';
