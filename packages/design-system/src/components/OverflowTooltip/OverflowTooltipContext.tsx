import { createContext, useContext } from 'react';

interface OverflowTooltipContextValue {
  isOverflowing: boolean;
  setIsOverflowing: (value: boolean) => void;
  forceTooltip?: boolean;
}

export const OverflowTooltipContext = createContext<OverflowTooltipContextValue | null>(null);

export const useOverflowTooltip = () => {
  const context = useContext(OverflowTooltipContext);

  if (!context) {
    throw new Error('OverflowTooltip compound components must be used within OverflowTooltip');
  }

  return context;
};
