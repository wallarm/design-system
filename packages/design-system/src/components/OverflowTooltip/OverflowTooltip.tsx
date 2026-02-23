import { type ReactNode, useState } from 'react';
import { Tooltip } from '../Tooltip';
import type { TooltipProps } from '../Tooltip/Tooltip';
import { OverflowTooltipContext } from './OverflowTooltipContext';

export interface OverflowTooltipProps {
  children: ReactNode;
  forceTooltip?: boolean;
  positioning?: TooltipProps['positioning'];
}

/**
 * Root component for OverflowTooltip.
 * Automatically detects overflow in child elements.
 */
export const OverflowTooltip = ({
  children,
  forceTooltip = false,
  positioning,
}: OverflowTooltipProps) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const shouldShowTooltip = isOverflowing || forceTooltip;

  return (
    <OverflowTooltipContext.Provider
      value={{
        isOverflowing,
        setIsOverflowing,
        forceTooltip,
      }}
    >
      <Tooltip open={shouldShowTooltip ? undefined : false} positioning={positioning}>
        {children}
      </Tooltip>
    </OverflowTooltipContext.Provider>
  );
};

OverflowTooltip.displayName = 'OverflowTooltip';
