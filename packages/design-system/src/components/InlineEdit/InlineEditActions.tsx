import type { FC } from 'react';
import { Check } from '../../icons/Check';
import { X } from '../../icons/X';
import { Button } from '../Button';
import { Kbd } from '../Kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export interface InlineEditActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export const InlineEditActions: FC<InlineEditActionsProps> = ({ onSubmit, onCancel }) => (
  <div
    className='absolute right-0 top-full mt-4 flex z-10'
    data-slot='inline-edit-actions'
    onKeyDown={e => e.stopPropagation()}
  >
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size='small'
          variant='outline'
          color='neutral'
          className='rounded-r-none border-r-0'
          onClick={onSubmit}
          aria-label='Save'
          // Mouse-only affordance (keyboard commits via Enter). Keeping it out
          // of the tab order lets Tab blur the input and commit under
          // submitMode 'blur'/'both'; otherwise Tab lands on this button — which
          // sits inside the control — so the blur handler treats it as an
          // internal focus move and never submits.
          tabIndex={-1}
        >
          <Check className='text-slate-500' />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Save <Kbd>↵</Kbd>
      </TooltipContent>
    </Tooltip>
    <Tooltip closeOnEscape={false}>
      <TooltipTrigger asChild>
        <Button
          size='small'
          variant='outline'
          color='neutral'
          className='rounded-l-none'
          onClick={onCancel}
          aria-label='Cancel'
          // Mouse-only affordance (keyboard cancels via Escape); kept out of the
          // tab order for the same reason as Save above.
          tabIndex={-1}
        >
          <X className='text-slate-500' />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Discard <Kbd>ESC</Kbd>
      </TooltipContent>
    </Tooltip>
  </div>
);

InlineEditActions.displayName = 'InlineEditActions';
