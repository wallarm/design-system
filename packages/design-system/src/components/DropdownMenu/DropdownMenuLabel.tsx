import type { ComponentPropsWithoutRef, FC, Ref } from 'react';
import { Label } from '@radix-ui/react-dropdown-menu';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { dropdownMenuLabelVariants } from './classes';

type DropdownMenuLabelNativeProps = ComponentPropsWithoutRef<typeof Label>;

type DropdownMenuLabelVariantsProps = VariantProps<typeof dropdownMenuLabelVariants>;

export type DropdownMenuLabelProps = DropdownMenuLabelNativeProps &
  DropdownMenuLabelVariantsProps & {
    ref?: Ref<HTMLDivElement>;
  };

export const DropdownMenuLabel: FC<DropdownMenuLabelProps> = ({ className, inset, ...props }) => (
  <Label className={cn(dropdownMenuLabelVariants({ inset }), className)} {...props} />
);

DropdownMenuLabel.displayName = 'DropdownMenuLabel';
