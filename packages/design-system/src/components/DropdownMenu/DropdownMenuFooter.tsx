import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';

interface DropdownMenuFooterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuFooter: FC<DropdownMenuFooterProps> = ({
  className,
  children,
  ref,
  ...props
}) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-4 border-t border-border-primary mx-8 pt-8 pb-4',
      'text-xs font-medium text-text-secondary',
      className,
    )}
    data-slot='dropdown-menu-footer'
    {...props}
  >
    {children}
  </div>
);

DropdownMenuFooter.displayName = 'DropdownMenuFooter';
