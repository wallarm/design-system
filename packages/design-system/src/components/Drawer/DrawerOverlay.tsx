import type { FC, Ref } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { useTestId } from '../../utils/testId';
import { Overlay } from '../Overlay';

interface DrawerOverlayProps {
  ref?: Ref<HTMLDivElement>;
}

export const DrawerOverlay: FC<DrawerOverlayProps> = ({ ref }) => {
  const testId = useTestId('overlay');

  return (
    <Dialog.Backdrop ref={ref} asChild>
      <Overlay data-testid={testId} />
    </Dialog.Backdrop>
  );
};

DrawerOverlay.displayName = 'DrawerOverlay';
