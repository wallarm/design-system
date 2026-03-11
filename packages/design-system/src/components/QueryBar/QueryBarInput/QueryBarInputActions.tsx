import type { FC } from 'react';
import { X } from '../../../icons/X';
import { Button } from '../../Button';
import { Kbd } from '../../Kbd/Kbd';
import { KbdGroup } from '../../Kbd/KbdGroup';
import { useQueryBarContext } from '../QueryBarContext';

export const QueryBarInputActions: FC = () => {
  const { chips, buildingChipData, showKeyboardHint, onClear } = useQueryBarContext();

  const hasChips = chips.length > 0;
  const hasContent = hasChips || buildingChipData != null;

  return (
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
};

QueryBarInputActions.displayName = 'QueryBarInputActions';
