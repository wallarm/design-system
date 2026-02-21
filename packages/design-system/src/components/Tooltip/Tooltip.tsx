import type { FC, ReactNode } from 'react';
import { Tooltip as ArkUiTooltip } from '@ark-ui/react/tooltip';

export interface TooltipProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  closeOnPointerDown?: boolean;
  closeOnEscape?: boolean;
  closeOnScroll?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  positioning?: ArkUiTooltip.RootProps['positioning'];
}

const TOOLTIP_POSITIONING_DEFAULT: ArkUiTooltip.RootProps['positioning'] = {
  offset: {
    mainAxis: 6,
  },
  overflowPadding: 8,
};

export const Tooltip: FC<TooltipProps> = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  openDelay,
  closeDelay,
  closeOnPointerDown,
  closeOnEscape,
  closeOnScroll,
  interactive,
  disabled,
  positioning,
}) => {
  const handleOpenChange = (details: ArkUiTooltip.OpenChangeDetails) => {
    onOpenChange?.(details.open);
  };

  return (
    <ArkUiTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      openDelay={openDelay}
      closeDelay={closeDelay}
      closeOnPointerDown={closeOnPointerDown}
      closeOnEscape={closeOnEscape}
      closeOnScroll={closeOnScroll}
      interactive={interactive}
      disabled={disabled}
      positioning={positioning ?? TOOLTIP_POSITIONING_DEFAULT}
      lazyMount
      unmountOnExit
    >
      {children}
    </ArkUiTooltip.Root>
  );
};

Tooltip.displayName = 'Tooltip';
