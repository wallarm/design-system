import type { FC, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';

export interface DrawerFooterProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const DrawerFooter: FC<DrawerFooterProps> = ({ children, ref }) => (
  <div
    ref={ref}
    data-slot='drawer-footer'
    className={cn(
      'rounded-b-12 bg-bg-surface-2',
      'flex items-center justify-end gap-8 shrink-0 w-full px-24 py-16',
      'relative',
    )}
  >
    {children}
  </div>
);

DrawerFooter.displayName = 'DrawerFooter';
