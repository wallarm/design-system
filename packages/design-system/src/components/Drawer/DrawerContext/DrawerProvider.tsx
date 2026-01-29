import { type FC, type ReactNode, useState } from 'react';

import { useControlled } from '../../../hooks';
import { DRAWER_SIZES, DRAWER_WIDTH_CONSTRAINTS } from '../constants';

import { DrawerContext } from './DrawerContext';
import type { DrawerContextValue } from './types';

interface DrawerContextProviderProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Whether ESC key closes the drawer (default: true) */
  closeOnEscape: boolean;
  /** Overlay visibility (default: true) */
  overlay: boolean;
  /** Width - number for pixels, string for percentage (e.g., "50%") */
  width?: number | string;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
}

export const DrawerProvider: FC<DrawerContextProviderProps> = ({
  children,
  open,
  onOpenChange,
  closeOnEscape,
  overlay,
  width: initialWidth = DRAWER_SIZES.small,
  minWidth = DRAWER_WIDTH_CONSTRAINTS.min,
  maxWidth = DRAWER_WIDTH_CONSTRAINTS.max,
}) => {
  const [isOpen = false, setIsOpenUncontrolled] = useControlled({
    controlled: open,
    default: false,
  });

  // Content state
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpenUncontrolled(open);
    onOpenChange?.(open);
  };

  const contextValue: DrawerContextValue = {
    // Behavior management
    isOpen,
    onOpenChange: handleOpenChange,
    closeOnEscape,
    overlay,

    // Size management
    width,
    setWidth,
    isResizing,
    setIsResizing,
    minWidth,
    maxWidth,
  };

  return (
    <DrawerContext.Provider value={contextValue}>
      {children}
    </DrawerContext.Provider>
  );
};
