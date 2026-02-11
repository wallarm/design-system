import type { FC, ReactNode } from 'react';
import { DrawerProvider } from './DrawerContext';
import { DrawerRoot } from './DrawerRoot';

export interface DrawerProps {
  children: ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Controlled open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Whether ESC key closes the drawer (default: true) */
  closeOnEscape?: boolean;
  /** Whether clicking outside closes the drawer (default: true) */
  closeOnOutsideClick?: boolean;
  /** Overlay visibility (default: true) */
  overlay?: boolean;
  /** Width - number for pixels, string for percentage (e.g., "50%") */
  width?: number | string;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
}

export const Drawer: FC<DrawerProps> = ({
  children,
  open,
  onOpenChange,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  overlay = true,
  width,
  minWidth,
  maxWidth,
}) => (
  <DrawerProvider
    open={open}
    onOpenChange={onOpenChange}
    closeOnEscape={closeOnEscape}
    overlay={overlay}
    width={width}
    minWidth={minWidth}
    maxWidth={maxWidth}
  >
    <DrawerRoot closeOnEscape={closeOnEscape} closeOnOutsideClick={closeOnOutsideClick}>
      {children}
    </DrawerRoot>
  </DrawerProvider>
);

Drawer.displayName = 'Drawer';
