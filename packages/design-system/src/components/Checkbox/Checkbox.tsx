import type { FC, Ref } from 'react';
import { Checkbox as ArkUiCheckbox } from '@ark-ui/react/checkbox';
import { cn } from '../../utils/cn';
import { TestIdProvider } from '../../utils/testId';

export interface CheckboxProps extends ArkUiCheckbox.RootProps {
  ref?: Ref<HTMLLabelElement>;
}

export const Checkbox: FC<CheckboxProps> = ({ children, ref, 'data-testid': testId, ...props }) => (
  <TestIdProvider value={testId}>
    <ArkUiCheckbox.Root
      {...props}
      ref={ref}
      data-testid={testId}
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
  </TestIdProvider>
);

Checkbox.displayName = 'Checkbox';
