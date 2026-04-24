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
      'bg-transparent p-0 border-0',
      'cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'outline-none focus-visible:ring-3 focus-visible:ring-focus-primary rounded-4',
    )}
  >
    <X size='md' />
  </button>
);
