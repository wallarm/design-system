import type { FC, Ref } from 'react';

import { cn } from '../../utils/cn';
import { ButtonBase, type ButtonBaseProps } from '../ButtonBase';

/**
 * "More" button component for SegmentedControl.
 *
 * Used to show additional options or trigger a menu when there are too many items
 * to display in the segmented control. Uses compound pattern - pass icon and text as children.
 * Height matches SegmentedControlItem (28px) as per Figma design.
 */
export type SegmentedControlButtonProps = ButtonBaseProps & {
  ref?: Ref<HTMLButtonElement>;
};

export const SegmentedControlButton: FC<SegmentedControlButtonProps> = ({
  className,
  children,
  size = 'medium',
  ref,
  ...props
}) => {
  return (
    <ButtonBase
      ref={ref}
      size={size}
      className={cn(
        'min-h-28 min-w-28 h-auto px-12 py-4',
        'bg-transparent text-text-secondary',
        'hover:text-text-primary',
        'focus-visible:ring-3 focus-visible:ring-focus-primary',
        className,
      )}
      {...props}
    >
      {children}
    </ButtonBase>
  );
};

SegmentedControlButton.displayName = 'SegmentedControlButton';
