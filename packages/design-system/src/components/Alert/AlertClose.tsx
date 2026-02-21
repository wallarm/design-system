import type { ButtonHTMLAttributes, FC, Ref } from 'react';
import { X } from '../../icons';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export interface AlertCloseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  ref?: Ref<HTMLButtonElement>;
  /** Callback when the close button is clicked */
  onClick?: () => void;
}

/**
 * Close button component for Alert.
 *
 * Renders a close button with an X icon and "Close" tooltip.
 */
export const AlertClose: FC<AlertCloseProps> = ({ ref, onClick, ...props }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...props}
          ref={ref}
          variant='ghost'
          color='neutral'
          size='small'
          aria-label='close'
          onClick={onClick}
        >
          <X />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Close</TooltipContent>
    </Tooltip>
  );
};

AlertClose.displayName = 'AlertClose';
