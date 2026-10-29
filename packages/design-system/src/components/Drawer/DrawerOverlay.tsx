import type { FC, Ref } from 'react';

import { Dialog } from '@ark-ui/react/dialog';

import { Overlay } from '../Overlay';

interface DrawerOverlayProps {
  ref?: Ref<HTMLDivElement>;
}

export const DrawerOverlay: FC<DrawerOverlayProps> = ({ ref }) => (
  <Dialog.Backdrop ref={ref} asChild>
    <Overlay />
  </Dialog.Backdrop>
);

DrawerOverlay.displayName = 'DrawerOverlay';
