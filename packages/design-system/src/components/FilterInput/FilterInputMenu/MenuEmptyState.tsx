import type { FC } from 'react';

interface MenuEmptyStateProps {
  /** Overrides the default text when the emptiness has a specific meaning. */
  label?: string;
}

export const MenuEmptyState: FC<MenuEmptyStateProps> = ({ label = 'No results' }) => (
  <output className='flex items-center justify-center pt-2 pb-4 text-sm text-text-secondary'>
    {label}
  </output>
);

MenuEmptyState.displayName = 'MenuEmptyState';
