import type { FC, ReactNode } from 'react';
import { Portal, type PortalProps } from '@ark-ui/react/portal';

export interface DrawerPortalProps extends PortalProps {
  children: ReactNode;
}

export const DrawerPortal: FC<DrawerPortalProps> = ({ children, ...props }) => (
  <Portal {...props}>{children}</Portal>
);

DrawerPortal.displayName = 'DrawerPortal';
