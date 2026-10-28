import type { FC, Ref } from 'react';

import { cn } from '../../utils/cn';
import { Kbd } from '../Kbd';

export interface CalendarKeyboardHintsProps {
  /** Additional className for styling */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Keyboard navigation hints for the calendar footer.
 * Shows arrow keys for navigation, Enter for selection, and Esc to close.
 */
export const CalendarKeyboardHints: FC<CalendarKeyboardHintsProps> = ({ ref, className }) => (
  <div ref={ref} className={cn('flex items-center gap-12', className)}>
    <div className='flex items-center gap-4'>
      <div className='flex items-center gap-2'>
        <Kbd size='small'>&larr;</Kbd>
        <Kbd size='small'>&uarr;</Kbd>
        <Kbd size='small'>&darr;</Kbd>
        <Kbd size='small'>&rarr;</Kbd>
      </div>
      <span className='font-sans text-xs font-medium text-text-secondary'>to navigate</span>
    </div>
    <div className='flex items-center gap-4'>
      <Kbd size='small'>Enter</Kbd>
      <span className='font-sans text-xs font-medium text-text-secondary'>to select</span>
    </div>
    <div className='flex items-center gap-4'>
      <Kbd size='small'>ESC</Kbd>
      <span className='font-sans text-xs font-medium text-text-secondary'>to close</span>
    </div>
  </div>
);

CalendarKeyboardHints.displayName = 'CalendarKeyboardHints';
