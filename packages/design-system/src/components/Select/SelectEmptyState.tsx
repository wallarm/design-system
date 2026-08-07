import type { FC, ReactNode } from 'react';
import { EmptyState, EmptyStateDescription, EmptyStateMessage } from '../EmptyState';

export interface SelectEmptyStateProps {
  description?: ReactNode;
}

export const SelectEmptyState: FC<SelectEmptyStateProps> = ({ description = 'No results' }) => (
  <EmptyState type='no-results'>
    <EmptyStateMessage>
      <EmptyStateDescription>{description}</EmptyStateDescription>
    </EmptyStateMessage>
  </EmptyState>
);

SelectEmptyState.displayName = 'SelectEmptyState';
