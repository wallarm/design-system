import type { FC } from 'react';
import { Checkbox as ArkUiCheckbox } from '@ark-ui/react/checkbox';
import { cn } from '../../utils/cn';

export type CheckboxProps = Omit<ArkUiCheckbox.RootProps, 'className'>;

export const Checkbox: FC<CheckboxProps> = ({ children, ...props }) => (
  <ArkUiCheckbox.Root
    {...props}
    className={cn(
      // Layout ---- basic
      'items-center gap-x-8',
      // Layout ---- no Description
      '[&:not(:has([data-part=description]))]:flex',
      // Layout ---- with Description
      '[&:has([data-part=description])]:grid',
      '[&:has([data-part=description])]:grid-cols-[16px_auto]',
      '*:data-[part=description]:col-start-2 *:data-[part=description]:col-end-3',
      // Active
      '[&:not([data-disabled])]:cursor-pointer',
      // Disabled
      'data-disabled:pointer-none data-disabled:cursor-not-allowed',
    )}
  >
    {children}
    <ArkUiCheckbox.HiddenInput />
  </ArkUiCheckbox.Root>
);

Checkbox.displayName = 'Checkbox';
