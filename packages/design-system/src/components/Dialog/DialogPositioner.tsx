import type { FC } from 'react';

import { Dialog as ArkUiDialog } from '@ark-ui/react/dialog';

import { cn } from '../../utils/cn';
import {
  type DrawerPositionerProps,
  drawerPositionerVariants,
} from '../Drawer';

type DialogPositionerProps = Omit<DrawerPositionerProps, 'isResizing'>;

export const DialogPositioner: FC<DialogPositionerProps> = ({ children }) => (
  <ArkUiDialog.Positioner
    className={cn(
      drawerPositionerVariants({ isResizing: false }),
      'fixed inset-0',
      'flex flex-col justify-center items-center p-32',
      'h-full min-h-0',
    )}
  >
    {children}
  </ArkUiDialog.Positioner>
);

DialogPositioner.displayName = 'DialogPositioner';
