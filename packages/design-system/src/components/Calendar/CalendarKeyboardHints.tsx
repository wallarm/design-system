import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Kbd } from '../Kbd';

export interface CalendarKeyboardHintsProps {
  /** Additional className for styling */
  className?: string;
}

/**
 * Keyboard navigation hints for the calendar footer.
 * Shows arrow keys for navigation, Enter for selection, and Esc to close.
 */
export const CalendarKeyboardHints = forwardRef<HTMLDivElement, CalendarKeyboardHintsProps>(
  ({ className }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-12', className)}>
      <div className='flex items-center gap-4'>
        <Kbd size='small'>&larr;</Kbd>
        <Kbd size='small'>&uarr;</Kbd>
        <Kbd size='small'>&darr;</Kbd>
        <Kbd size='small'>&rarr;</Kbd>
        <span className='font-sans font-medium text-xs text-text-secondary'>to navigate</span>
      </div>
      <div className='flex items-center gap-4'>
        <Kbd size='small'>Enter</Kbd>
        <span className='font-sans font-medium text-xs text-text-secondary'>to select</span>
      </div>
      <div className='flex items-center gap-4'>
        <Kbd size='small'>Esc</Kbd>
        <span className='font-sans font-medium text-xs text-text-secondary'>to close</span>
      </div>
    </div>
  ),
);

CalendarKeyboardHints.displayName = 'CalendarKeyboardHints';
