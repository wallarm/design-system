import type { FC } from 'react';
import { cn } from '../../utils/cn';

export interface TemporalPlaceholderProps {
  text: string;
  className?: string;
}

/**
 * Placeholder component for temporal inputs (date/time) when no value is selected.
 * Shows gray text that disappears when the input is focused.
 */
export const TemporalPlaceholder: FC<TemporalPlaceholderProps> = ({ text, className }) => {
  return (
    <span
      className={cn(
        'pointer-events-none absolute inset-0 flex items-center px-1',
        'text-text-secondary font-sans text-sm',
        'select-none whitespace-nowrap',
        className,
      )}
      aria-hidden='true'
    >
      {text}
    </span>
  );
};
