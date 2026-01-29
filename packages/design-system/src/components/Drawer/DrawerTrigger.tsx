import type { FC, ReactNode, Ref } from 'react';

import { Dialog } from '@ark-ui/react/dialog';

export interface DrawerTriggerProps {
  children: ReactNode;
  /** Render as child component */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const DrawerTrigger: FC<DrawerTriggerProps> = ({
  children,
  asChild = false,
  ref,
}) => (
  <Dialog.Trigger ref={ref} asChild={asChild}>
    {children}
  </Dialog.Trigger>
);

DrawerTrigger.displayName = 'DrawerTrigger';
