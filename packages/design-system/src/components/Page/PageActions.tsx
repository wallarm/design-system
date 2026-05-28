import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface PageActionsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const PageActions: FC<PageActionsProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('actions');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='page-actions'
      className={cn('flex items-center gap-8 shrink-0', className)}
    >
      {children}
    </div>
  );
};

PageActions.displayName = 'PageActions';
