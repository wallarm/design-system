import type { FC } from 'react';

export const MenuEmptyState: FC = () => (
  <div className='flex items-center justify-center pt-2 pb-4 text-sm text-text-secondary'>
    No results
  </div>
);

MenuEmptyState.displayName = 'MenuEmptyState';
