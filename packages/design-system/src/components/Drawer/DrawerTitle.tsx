import type { FC, ReactNode, Ref } from 'react';

import { Dialog } from '@ark-ui/react/dialog';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface DrawerTitleProps {
  children: ReactNode;
  ref?: Ref<HTMLHeadingElement>;
}

export const DrawerTitle: FC<DrawerTitleProps> = ({ children, ref }) => {
  const testId = useTestId('title');

  return (
    <Dialog.Title
      ref={ref}
      data-testid={testId}
      className={cn(
        'min-w-0 flex-1',
        'font-sans-display text-lg leading-28 font-medium',
        'text-text-primary',
      )}
    >
      {children}
    </Dialog.Title>
  );
};

DrawerTitle.displayName = 'DrawerTitle';
