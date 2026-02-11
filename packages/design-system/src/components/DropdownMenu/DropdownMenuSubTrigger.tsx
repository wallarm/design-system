import type { ComponentPropsWithoutRef, ElementRef, FC, Ref } from 'react';
import { SubTrigger } from '@radix-ui/react-dropdown-menu';
import { ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { dropdownMenuItemVariants } from './classes';
import type { DropdownMenuItemVariantsProps } from './DropdownMenuItem';

type DropdownMenuSubTriggerNativeProps = ComponentPropsWithoutRef<typeof SubTrigger>;

export type DropdownMenuSubTriggerVariantsProps = DropdownMenuItemVariantsProps;

interface DropdownMenuSubTriggerBaseProps {
  inset?: boolean;
  ref?: Ref<ElementRef<typeof SubTrigger>>;
}

type DropdownMenuSubTriggerProps = DropdownMenuSubTriggerNativeProps &
  DropdownMenuSubTriggerVariantsProps &
  DropdownMenuSubTriggerBaseProps;

export const DropdownMenuSubTrigger: FC<DropdownMenuSubTriggerProps> = ({
  inset = false,
  variant = 'default',
  children,
  ...props
}) => (
  <SubTrigger {...props} className={cn(dropdownMenuItemVariants({ variant, inset }))}>
    {children}

    <div className='ml-auto before:content-[""] before:flex before:w-8 before:shrink-0'>
      <ChevronRight />
    </div>
  </SubTrigger>
);

DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';
