import type { FC, ReactNode } from 'react';
import type { DialogInteractOutsideEvent as DrawerInteractOutsideEvent } from '@ark-ui/react/dialog';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { DrawerProvider } from './DrawerContext';
import { DrawerRoot } from './DrawerRoot';

export interface DrawerProps extends TestableProps {
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
  /** Whether the drawer is modal — blocks interaction with the rest of the page (default: true) */
  modal?: boolean;
  /** Width - number for pixels, string for percentage (e.g., "50%") */
  width?: number | string;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Fired when the user interacts outside the drawer (e.g. clicks the backdrop). */
  onInteractOutside?: (event: DrawerInteractOutsideEvent) => void;
  /** Fired when the user presses the Escape key while the drawer is open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export const Drawer: FC<DrawerProps> = ({
  children,
  open,
  onOpenChange,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  overlay = true,
  modal = true,
  width,
  minWidth,
  maxWidth,
  onInteractOutside,
  onEscapeKeyDown,
  'data-testid': testId,
}) => (
  <DrawerProvider
    open={open}
    onOpenChange={onOpenChange}
    closeOnEscape={closeOnEscape}
    overlay={overlay}
    modal={modal}
    width={width}
    minWidth={minWidth}
    maxWidth={maxWidth}
  >
    <DrawerRoot
      closeOnEscape={closeOnEscape}
      closeOnOutsideClick={closeOnOutsideClick}
      modal={modal}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </DrawerRoot>
  </DrawerProvider>
);

Drawer.displayName = 'Drawer';
