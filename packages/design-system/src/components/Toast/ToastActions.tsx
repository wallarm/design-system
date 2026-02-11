import type { FC, PropsWithChildren } from 'react';
import { cn } from '../../utils/cn';

export const ToastActions: FC<PropsWithChildren> = ({ children }) => {
  return <div className={cn('flex items-center gap-4')}>{children}</div>;
};

ToastActions.displayName = 'ToastActions';
