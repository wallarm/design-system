import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type NavPanelDividerProps = HTMLAttributes<HTMLDivElement>;

export const NavPanelDivider: FC<NavPanelDividerProps> = ({ className, ...props }) => (
  <div
    {...props}
    role='none'
    data-slot='nav-panel-divider'
    className={cn('my-4 mx-8 h-px shrink-0 bg-border-primary', className)}
  />
);

NavPanelDivider.displayName = 'NavPanelDivider';
