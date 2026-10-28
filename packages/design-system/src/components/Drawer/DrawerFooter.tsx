import type { FC, ReactNode, Ref } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export interface DrawerFooterProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const DrawerFooter: FC<DrawerFooterProps> = ({ children, ref }) => {
  const testId = useTestId('footer');

  return (
    <div
      ref={ref}
      data-testid={testId}
      data-slot='drawer-footer'
      className={cn(
        'rounded-b-12 bg-bg-surface-2',
        'flex w-full shrink-0 items-center justify-end gap-8 px-24 py-16',
        'relative',
      )}
    >
      {children}
    </div>
  );
};

DrawerFooter.displayName = 'DrawerFooter';
