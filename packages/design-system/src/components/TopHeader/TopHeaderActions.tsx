import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface TopHeaderActionsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const TopHeaderActions: FC<TopHeaderActionsProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('actions');

  return (
    <div
      data-testid={testId}
      {...props}
      ref={ref}
      data-slot='top-header-actions'
      className={cn('flex items-center gap-8', className)}
    >
      {children}
    </div>
  );
};

TopHeaderActions.displayName = 'TopHeaderActions';
