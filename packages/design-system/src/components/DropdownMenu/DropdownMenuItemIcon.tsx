import type { FC, PropsWithChildren } from 'react';
import { cn } from '../../utils/cn';

export const DropdownMenuItemIcon: FC<PropsWithChildren> = ({ children }) => (
  <div className={cn('flex items-start self-start h-full pt-2')}>{children}</div>
);
