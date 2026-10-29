import type { FC, ReactNode } from 'react';
import type { PortalProps } from '@ark-ui/react/portal';
import { Portal } from '../../lib/portal/Portal';

export interface DrawerPortalProps extends PortalProps {
  children: ReactNode;
}

export const DrawerPortal: FC<DrawerPortalProps> = ({ children, ...props }) => (
  <Portal {...props}>{children}</Portal>
);

DrawerPortal.displayName = 'DrawerPortal';
