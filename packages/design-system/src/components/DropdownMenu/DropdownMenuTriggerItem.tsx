import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { dropdownMenuItemVariants } from './classes';
import type { DropdownMenuItemVariantsProps } from './DropdownMenuItem';

export interface DropdownMenuTriggerItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    DropdownMenuItemVariantsProps,
    TestableProps {
  children: ReactNode;
  asChild?: boolean;
  inset?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuTriggerItem: FC<DropdownMenuTriggerItemProps> = ({
  variant = 'default',
  inset = false,
  children,
  className,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('trigger-item', testIdProp);

  return (
    <Menu.TriggerItem
      {...rest}
      data-testid={testId}
      className={cn(dropdownMenuItemVariants({ variant, inset }), className)}
    >
      {children}

      <div className='ml-auto before:content-[""] before:flex before:w-8 before:shrink-0'>
        <ChevronRight />
      </div>
    </Menu.TriggerItem>
  );
};

DropdownMenuTriggerItem.displayName = 'DropdownMenuTriggerItem';
