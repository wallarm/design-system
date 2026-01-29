import type { ComponentPropsWithoutRef, ElementRef, FC, Ref } from 'react';

import { SubContent } from '@radix-ui/react-dropdown-menu';

import { cn } from '../../utils/cn';

/**
 * @description Need to align content and sub content menu items on the same level
 */
const DROPDOWN_MENU_SUB_CONTENT_ALIGN_OFFSET = -9;

const DROPDOWN_MENU_SUB_SIDE_OFFSET = 4;

type DropdownMenuSubContentProps = ComponentPropsWithoutRef<
  typeof SubContent
> & {
  ref?: Ref<ElementRef<typeof SubContent>>;
};

export const DropdownMenuSubContent: FC<DropdownMenuSubContentProps> = ({
  className,
  ref,
  ...props
}) => (
  <SubContent
    ref={ref}
    className={cn(
      // Dimensions
      'min-w-128',
      // Leveling and scrolling
      'z-50 overflow-hidden',
      // Visual
      'rounded-12 border border-border-primary bg-bg-surface-2 p-8 text-text-primary shadow-md',
      // Animation base
      'origin-[--radix-dropdown-menu-content-transform-origin]',
      // Animation opened
      'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      // Animation closed
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      // Animation sides
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    alignOffset={DROPDOWN_MENU_SUB_CONTENT_ALIGN_OFFSET}
    sideOffset={DROPDOWN_MENU_SUB_SIDE_OFFSET}
    {...props}
  />
);

DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';
