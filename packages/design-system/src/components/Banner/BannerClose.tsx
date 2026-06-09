import type { ButtonHTMLAttributes, FC, Ref } from 'react';
import { X } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useBannerColor } from './BannerContext';

export interface BannerCloseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  ref?: Ref<HTMLButtonElement>;
  /** Callback when the close button is clicked */
  onClick?: () => void;
}

/**
 * Close button for Banner.
 *
 * Renders a ghost icon button with a "Close" tooltip. The icon color adapts to
 * the variant so it stays legible on the dark primary banner.
 */
export const BannerClose: FC<BannerCloseProps> = ({ ref, onClick, ...props }) => {
  const testId = useTestId('close');
  const color = useBannerColor();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...props}
          ref={ref}
          data-testid={testId}
          variant='ghost'
          color={color === 'primary' ? 'neutral-alt' : 'neutral'}
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
