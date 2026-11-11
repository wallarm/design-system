import type { FC } from 'react';

import { X } from '../../icons';
import { cn } from '../../utils/cn';

interface TemporalClearProps {
  disabled?: boolean;
  onClick: () => void;
}

export const TemporalClear: FC<TemporalClearProps> = ({ onClick, disabled = false }) => (
  <button
    type='button'
    onClick={onClick}
    disabled={disabled}
    aria-label='Clear'
    className={cn(
      'inline-flex items-center justify-center',
      'icon-md text-icon-primary',
      'border-0 bg-transparent p-0',
      'cursor-pointer',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'rounded-4 outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
    )}
  >
    <X size='md' />
  </button>
);
