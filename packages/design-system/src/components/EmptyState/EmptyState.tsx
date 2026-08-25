import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { emptyStateVariants } from './classes';
import { EmptyStateProvider } from './EmptyStateContext';

export interface EmptyStateProps
  extends Omit<VariantProps<typeof emptyStateVariants>, 'type'>,
    Omit<HTMLAttributes<HTMLDivElement>, 'type'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  type?: 'collection-empty' | 'no-results';
  children?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({
  ref,
  type = 'collection-empty',
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <EmptyStateProvider value={type}>
        <div
          {...props}
          ref={ref}
          role='status'
          data-slot='empty-state'
          data-testid={testId}
          className={cn(emptyStateVariants({ type }), className)}
        >
          {children}
        </div>
      </EmptyStateProvider>
    </TestIdProvider>
  );
};

EmptyState.displayName = 'EmptyState';
