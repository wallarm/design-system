import type { FC, ReactNode } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { cn } from '../../utils/cn';
import { drawerPositionerVariants } from './classes';
import { useDrawerContext } from './DrawerContext';

export interface DrawerPositionerProps {
  children: ReactNode;
  isResizing: boolean;
}

export const DrawerPositioner: FC<DrawerPositionerProps> = ({ children, isResizing }) => {
  const { modal } = useDrawerContext();

  return (
    <Dialog.Positioner
      className={cn(
        drawerPositionerVariants({ isResizing }),
        'fixed right-0 left-0 top-0 bottom-0',
        'justify-end  p-8',
        !modal && 'pointer-events-none [&>*]:pointer-events-auto',
      )}
    >
      {children}
    </Dialog.Positioner>
  );
};

DrawerPositioner.displayName = 'DrawerPositioner';
