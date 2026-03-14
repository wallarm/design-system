import type { FC, ReactNode, Ref } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { useTestId } from '../../utils/testId';

export interface DrawerTriggerProps {
  children: ReactNode;
  /** Render as child component */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const DrawerTrigger: FC<DrawerTriggerProps> = ({ children, asChild = false, ref }) => {
  const testId = useTestId('trigger');

  return (
    <Dialog.Trigger ref={ref} data-testid={testId} asChild={asChild}>
      {children}
    </Dialog.Trigger>
  );
};

DrawerTrigger.displayName = 'DrawerTrigger';
