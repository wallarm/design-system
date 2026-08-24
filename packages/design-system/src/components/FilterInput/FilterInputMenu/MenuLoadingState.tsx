import type { FC } from 'react';
import { Loader } from '../../Loader';

/**
 * Value-menu placeholder shown while a field's options are loading (e.g. an
 * on-demand fetch in flight). Parallels {@link MenuEmptyState}.
 */
export const MenuLoadingState: FC = () => (
  <div
    className='flex items-center justify-center pt-2 pb-4 text-text-secondary'
    role='status'
    aria-live='polite'
  >
    <Loader size='sm' />
  </div>
);

MenuLoadingState.displayName = 'MenuLoadingState';
