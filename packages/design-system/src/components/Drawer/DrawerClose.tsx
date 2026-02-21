import type { FC, FocusEvent, ReactNode, Ref } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { X } from '../../icons';
import { Button } from '../Button';
import { Kbd } from '../Kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useDrawerContext } from './DrawerContext';

export interface DrawerCloseProps {
  children?: ReactNode;
  /** Render as child component */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const DrawerClose: FC<DrawerCloseProps> = ({ children, asChild = false, ref }) => {
  const { closeOnEscape } = useDrawerContext();

  const handleFocusCapture = (event: FocusEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  if (asChild) {
    return (
      <Dialog.CloseTrigger ref={ref} asChild>
        {children}
      </Dialog.CloseTrigger>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Dialog.CloseTrigger asChild onFocusCapture={handleFocusCapture}>
          <Button ref={ref} variant='ghost' color='neutral' size='small' aria-label='Close drawer'>
            {children || <X />}
          </Button>
        </Dialog.CloseTrigger>
      </TooltipTrigger>
      <TooltipContent>Close {closeOnEscape && <Kbd>ESC</Kbd>}</TooltipContent>
    </Tooltip>
  );
};

DrawerClose.displayName = 'DrawerClose';
