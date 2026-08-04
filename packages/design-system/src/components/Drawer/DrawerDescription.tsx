import type { FC, ReactNode, Ref } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface DrawerDescriptionProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const DrawerDescription: FC<DrawerDescriptionProps> = ({ children, ref }) => {
  const testId = useTestId('description');

  return (
    <Dialog.Description
      ref={ref}
      data-testid={testId}
      data-slot='drawer-description'
      className={cn('text-sm font-normal text-text-secondary')}
    >
      {children}
    </Dialog.Description>
  );
};

DrawerDescription.displayName = 'DrawerDescription';
