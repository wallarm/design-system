import type { FC, Ref } from 'react';

import { X } from '../../icons';
import { Button } from '../Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../Tooltip';

export interface AlertCloseProps {
  ref?: Ref<HTMLButtonElement>;
  /** Callback when the close button is clicked */
  onClick?: () => void;
}

/**
 * Close button component for Alert.
 *
 * Renders a close button with an X icon and "Close" tooltip.
 */
export const AlertClose: FC<AlertCloseProps> = ({ ref, onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            color="neutral"
            size="small"
            aria-label="close"
            onClick={onClick}
          >
            <X />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Close</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

AlertClose.displayName = 'AlertClose';
