import type { ButtonHTMLAttributes, FC, FocusEvent, ReactNode, Ref } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { X } from '../../icons';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Kbd } from '../Kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useDrawerContext } from './DrawerContext';

export interface DrawerCloseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>,
    TestableProps {
  children?: ReactNode;
  /** Render as child component */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const DrawerClose: FC<DrawerCloseProps> = ({
  children,
  asChild = false,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('close', testIdProp);
  const { closeOnEscape } = useDrawerContext();

  const handleFocusCapture = (event: FocusEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  if (asChild) {
    return (
      <Dialog.CloseTrigger {...rest} ref={ref} asChild data-testid={testIdProp}>
        {children}
      </Dialog.CloseTrigger>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Dialog.CloseTrigger asChild onFocusCapture={handleFocusCapture}>
          <Button
            ref={ref}
            variant='ghost'
            color='neutral'
            size='small'
            aria-label='Close drawer'
            {...rest}
            data-testid={testId}
          >
            {children || <X />}
          </Button>
        </Dialog.CloseTrigger>
      </TooltipTrigger>
      <TooltipContent>Close {closeOnEscape && <Kbd>ESC</Kbd>}</TooltipContent>
    </Tooltip>
  );
};

DrawerClose.displayName = 'DrawerClose';
