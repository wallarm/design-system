import { type ReactNode, useState } from 'react';

import { Tooltip, TooltipProvider } from '../Tooltip';

import { OverflowTooltipContext } from './OverflowTooltipContext';

export interface OverflowTooltipProps {
  children: ReactNode;
  forceTooltip?: boolean;
}

/**
 * Root component for OverflowTooltip.
 * Automatically detects overflow in child elements.
 */
export const OverflowTooltip = ({
  children,
  forceTooltip = false,
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
      <TooltipProvider>
        <Tooltip open={shouldShowTooltip ? undefined : false}>
          {children}
        </Tooltip>
      </TooltipProvider>
    </OverflowTooltipContext.Provider>
  );
};

OverflowTooltip.displayName = 'OverflowTooltip';
