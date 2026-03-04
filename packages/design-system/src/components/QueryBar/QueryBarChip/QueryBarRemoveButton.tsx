import type { FC } from 'react';
import { X } from '../../../icons/X';
import { cn } from '../../../utils/cn';

export const QueryBarRemoveButton: FC<{ error: boolean; onRemove: () => void }> = ({ error, onRemove }) => (
  <button
    type='button'
    onClick={e => {
      e.stopPropagation();
      onRemove();
    }}
    className={cn(
      'absolute -right-12 top-[-1px] bottom-[-1px]',
      'flex items-center justify-center p-0 cursor-pointer',
      'w-[18px] border border-solid border-l-0 rounded-r-8',
      error
        ? 'border-border-danger bg-bg-light-danger text-text-danger'
        : 'border-border-primary bg-badge-badge-bg text-text-secondary',
    )}
    data-slot='query-bar-chip-delete'
    aria-label='Remove filter'
  >
    <X size='sm' />
  </button>
);

QueryBarRemoveButton.displayName = 'QueryBarRemoveButton';
