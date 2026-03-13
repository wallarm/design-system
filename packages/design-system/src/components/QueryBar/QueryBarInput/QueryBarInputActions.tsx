import type { FC } from 'react';
import { Maximize2 } from '../../../icons/Maximize2';
import { Minimize2 } from '../../../icons/Minimize2';
import { X } from '../../../icons/X';
import { Button } from '../../Button';
import { Kbd } from '../../Kbd/Kbd';
import { KbdGroup } from '../../Kbd/KbdGroup';
import { Tooltip } from '../../Tooltip/Tooltip';
import { TooltipContent } from '../../Tooltip/TooltipContent';
import { TooltipTrigger } from '../../Tooltip/TooltipTrigger';
import { useQueryBarContext } from '../QueryBarContext';

export interface QueryBarInputActionsProps {
  isExpanded: boolean;
  isOverflowing: boolean;
  onToggleExpand: () => void;
}

export const QueryBarInputActions: FC<QueryBarInputActionsProps> = ({
  isExpanded,
  isOverflowing,
  onToggleExpand,
}) => {
  const { chips, buildingChipData, showKeyboardHint, onClear } = useQueryBarContext();

  const hasChips = chips.length > 0;
  const hasContent = hasChips || buildingChipData != null;
  const showExpandCollapse = isOverflowing || isExpanded;

  return (
    <div className='absolute right-8 top-0 z-10 flex items-center gap-8 pt-8'>
      {showKeyboardHint && !hasContent && (
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      )}
      {showExpandCollapse && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              color='neutral'
              size='small'
              onClick={onToggleExpand}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
              className='text-icon-secondary'
            >
              {isExpanded ? <Minimize2 /> : <Maximize2 />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isExpanded ? 'Collapse' : 'Expand'}</TooltipContent>
        </Tooltip>
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
