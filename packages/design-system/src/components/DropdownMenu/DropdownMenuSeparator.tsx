import type { ComponentPropsWithoutRef, FC, Ref } from 'react';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { cn } from '../../utils/cn';

export type DropdownMenuSeparatorProps = ComponentPropsWithoutRef<typeof Separator> & {
  ref?: Ref<HTMLDivElement>;
};

export const DropdownMenuSeparator: FC<DropdownMenuSeparatorProps> = ({ className, ...props }) => (
  <Separator className={cn('mx-8 my-4 h-px bg-border-primary', className)} {...props} />
);

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
