import type { FC } from 'react';
import { X } from '../../../../icons/X';
import { removeButtonVariants } from './classes';

export const QueryBarRemoveButton: FC<{ error: boolean; onRemove: () => void }> = ({
  error,
  onRemove,
}) => (
  <button
    type='button'
    onClick={e => {
      e.stopPropagation();
      onRemove();
    }}
    className={removeButtonVariants({ error })}
    data-slot='query-bar-chip-delete'
    aria-label='Remove filter'
  >
    <X size='sm' />
  </button>
);

QueryBarRemoveButton.displayName = 'QueryBarRemoveButton';
