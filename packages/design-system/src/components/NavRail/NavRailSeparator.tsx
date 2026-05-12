import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type NavRailSeparatorProps = HTMLAttributes<HTMLDivElement>;

export const NavRailSeparator: FC<NavRailSeparatorProps> = ({ className, ...props }) => (
  <div
    {...props}
    role='none'
    data-slot='nav-rail-separator'
    className={cn('my-4 mx-6 h-px bg-border-primary', className)}
  />
);
