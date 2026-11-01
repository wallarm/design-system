import { type PropsWithChildren, useContext } from 'react';
import { Portal as ArkPortal, type PortalProps } from '@ark-ui/react/portal';
import { PortalContainerContext } from './PortalContainerContext';

export const Portal = (props: PropsWithChildren<PortalProps>) => {
  const container = useContext(PortalContainerContext);
  return <ArkPortal {...props} container={props.container ?? container ?? undefined} />;
};
