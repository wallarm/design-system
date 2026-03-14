import type { FC, PropsWithChildren } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export const ToastActions: FC<PropsWithChildren> = ({ children }) => {
  const testId = useTestId('actions');

  return (
    <div className={cn('flex items-center gap-4')} data-testid={testId}>
      {children}
    </div>
  );
};

ToastActions.displayName = 'ToastActions';
