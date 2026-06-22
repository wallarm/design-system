import type { FC } from 'react';
import { EmptyState, EmptyStateDescription, EmptyStateMessage } from '../EmptyState';

export const SelectEmptyState: FC = () => (
  <EmptyState type='no-results'>
    <EmptyStateMessage>
      <EmptyStateDescription>No results</EmptyStateDescription>
    </EmptyStateMessage>
  </EmptyState>
);

SelectEmptyState.displayName = 'SelectEmptyState';
