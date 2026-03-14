import type { FC, HTMLAttributes, Ref } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type DropdownMenuSeparatorProps = HTMLAttributes<HTMLHRElement> & {
  ref?: Ref<HTMLHRElement>;
};

export const DropdownMenuSeparator: FC<DropdownMenuSeparatorProps> = ({ className, ...props }) => {
  const testId = useTestId('separator');

  return (
    <Menu.Separator
      data-testid={testId}
      className={cn('mx-8 my-4 h-px bg-border-primary border-none', className)}
      {...props}
    />
  );
};

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
