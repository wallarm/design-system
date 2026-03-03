import type { FC } from 'react';
import { X } from '../../../icons/X';
import { Button } from '../../Button';
import { Kbd } from '../../Kbd/Kbd';
import { KbdGroup } from '../../Kbd/KbdGroup';

interface FilterInputBarActionsProps {
  /** Whether to show the keyboard hint */
  showKeyboardHint?: boolean;
  /** Whether there is any content (chips or building chip) */
  hasContent?: boolean;
  /** Whether there are any completed chips */
  hasChips?: boolean;
  /** Callback to clear all filters */
  onClear: () => void;
}

export const FilterInputBarActions: FC<FilterInputBarActionsProps> = ({
  showKeyboardHint = false,
  hasContent = false,
  hasChips = false,
  onClear,
}) => (
  <div className='flex shrink-0 items-center gap-8 pr-12'>
    {showKeyboardHint && !hasContent && (
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    )}
    {hasChips && (
      <Button
        variant='ghost'
        color='neutral'
        size='small'
        onClick={onClear}
        aria-label='Clear all filters'
        className='text-icon-secondary'
      >
        <X />
      </Button>
    )}
  </div>
);

FilterInputBarActions.displayName = 'FilterInputBarActions';
