import type { FC, HTMLAttributes, Ref } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { dropdownMenuLabelVariants } from './classes';

type DropdownMenuLabelVariantsProps = VariantProps<typeof dropdownMenuLabelVariants>;

export type DropdownMenuLabelProps = HTMLAttributes<HTMLDivElement> &
  DropdownMenuLabelVariantsProps & {
    ref?: Ref<HTMLDivElement>;
  };

export const DropdownMenuLabel: FC<DropdownMenuLabelProps> = ({ className, inset, ...props }) => {
  const testId = useTestId('label');

  return (
    <div
      data-testid={testId}
      className={cn(dropdownMenuLabelVariants({ inset }), className)}
      {...props}
    />
  );
};

DropdownMenuLabel.displayName = 'DropdownMenuLabel';
