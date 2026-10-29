import type { FC, PropsWithChildren } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export const DropdownMenuItemIcon: FC<PropsWithChildren> = ({ children }) => {
  const testId = useTestId('item-icon');

  return (
    <div data-testid={testId} className={cn('flex h-full items-start self-start pt-2')}>
      {children}
    </div>
  );
};
