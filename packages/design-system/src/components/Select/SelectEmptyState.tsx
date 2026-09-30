import type { FC, ReactNode } from 'react';
import { EmptyState, EmptyStateDescription, EmptyStateMessage } from '../EmptyState';

export interface SelectEmptyStateProps {
  description?: ReactNode;
  className?: string;
}

export const SelectEmptyState: FC<SelectEmptyStateProps> = ({
  description = 'No results',
  className,
}) => (
  <EmptyState type='no-results' className={className}>
    <EmptyStateMessage>
      <EmptyStateDescription>{description}</EmptyStateDescription>
    </EmptyStateMessage>
  </EmptyState>
);

SelectEmptyState.displayName = 'SelectEmptyState';
