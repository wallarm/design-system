import type { FC, ReactNode } from 'react';

import { Dialog } from '@ark-ui/react/dialog';

import { useDrawerContext } from './DrawerContext';

interface DrawerRootProps {
  children: ReactNode;
  closeOnEscape: boolean;
  closeOnOutsideClick: boolean;
}

export const DrawerRoot: FC<DrawerRootProps> = ({
  children,
  closeOnEscape,
  closeOnOutsideClick,
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
      modal
      lazyMount
      unmountOnExit
    >
      {children}
    </Dialog.Root>
  );
};

DrawerRoot.displayName = 'DrawerRoot';
