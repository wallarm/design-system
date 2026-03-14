import type { FC, PropsWithChildren } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export const DropdownMenuItemIcon: FC<PropsWithChildren> = ({ children }) => {
  const testId = useTestId('item-icon');

  return (
    <div data-testid={testId} className={cn('flex items-start self-start h-full pt-2')}>
      {children}
    </div>
  );
};
