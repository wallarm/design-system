import type { FC, Ref } from 'react';

import { ButtonBase, type ButtonBaseProps } from '../ButtonBase';

import { tabsTriggerVariants } from './classes';

/**
 * "More" button component for SegmentedControl.
 *
 * Used to show additional options or trigger a menu when there are too many items
 * to display in the segmented control. Uses compound pattern - pass icon and text as children.
 * Height matches SegmentedControlItem (28px) as per Figma design.
 */
export interface TabsButtonProps extends ButtonBaseProps {
  size?: 'small' | 'medium';
  ref?: Ref<HTMLButtonElement>;
}

export const TabsButton: FC<TabsButtonProps> = ({
  children,
  size = 'medium',
  ref,
  ...props
}) => {
  return (
    <ButtonBase
      {...props}
      ref={ref}
      size={size}
      className={tabsTriggerVariants({ size })}
    >
      {children}
    </ButtonBase>
  );
};

TabsButton.displayName = 'TabsButton';
