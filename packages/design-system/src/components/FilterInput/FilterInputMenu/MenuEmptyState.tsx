import type { FC } from 'react';

interface MenuEmptyStateProps {
  /** Overrides the default text when the emptiness has a specific meaning. */
  label?: string;
}

export const MenuEmptyState: FC<MenuEmptyStateProps> = ({ label = 'No results' }) => (
  <div
    className='flex items-center justify-center pt-2 pb-4 text-sm text-text-secondary'
    role='status'
  >
    {label}
  </div>
);

MenuEmptyState.displayName = 'MenuEmptyState';
