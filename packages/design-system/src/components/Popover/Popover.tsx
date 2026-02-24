import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react';

export interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const POPOVER_POSITIONING_DEFAULT: ArkUiPopover.RootProps['positioning'] = {
  gutter: 8,
  offset: {
    mainAxis: 12,
  },
};

export const Popover: FC<PopoverProps> = ({ children, open, onOpenChange }) => {
  const handleOpenChange = ({ open }: ArkUiPopover.OpenChangeDetails) => {
    onOpenChange?.(open);
  };

  return (
    <ArkUiPopover.Root
      positioning={POPOVER_POSITIONING_DEFAULT}
      open={open}
      onOpenChange={handleOpenChange}
      lazyMount
      unmountOnExit
    >
      {children}
    </ArkUiPopover.Root>
  );
};

Popover.displayName = 'Popover';
