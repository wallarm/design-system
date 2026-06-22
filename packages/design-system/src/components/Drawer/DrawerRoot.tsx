import type { FC, ReactNode } from 'react';
import {
  Dialog,
  type DialogInteractOutsideEvent as DrawerInteractOutsideEvent,
} from '@ark-ui/react/dialog';
import { useDrawerContext } from './DrawerContext';

interface DrawerRootProps {
  children: ReactNode;
  closeOnEscape: boolean;
  closeOnOutsideClick: boolean;
  modal: boolean;
  onInteractOutside?: (event: DrawerInteractOutsideEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export const DrawerRoot: FC<DrawerRootProps> = ({
  children,
  closeOnEscape,
  closeOnOutsideClick,
  modal,
  onInteractOutside,
  onEscapeKeyDown,
}) => {
  const { isOpen, onOpenChange } = useDrawerContext();

  const handleOpenChange = ({ open }: Dialog.OpenChangeDetails) => {
    onOpenChange(open);
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      closeOnEscape={closeOnEscape}
      closeOnInteractOutside={closeOnOutsideClick}
      modal={modal}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      lazyMount
      unmountOnExit
    >
      {children}
    </Dialog.Root>
  );
};

DrawerRoot.displayName = 'DrawerRoot';
