import type { ButtonHTMLAttributes, FC, Ref } from 'react';
import { X } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export interface BannerCloseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  ref?: Ref<HTMLButtonElement>;
  /** Callback when the close button is clicked */
  onClick?: () => void;
}

/**
 * Close button for Banner.
 *
 * Renders an outline icon button (white background with a border) and a "Close"
 * tooltip. The same style is used across all variants — it stays legible on both
 * the light variants and the dark primary banner.
 */
export const BannerClose: FC<BannerCloseProps> = ({ ref, onClick, ...props }) => {
  const testId = useTestId('close');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...props}
          ref={ref}
          data-testid={testId}
          variant='outline'
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

BannerClose.displayName = 'BannerClose';
