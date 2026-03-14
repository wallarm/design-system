import type { FC } from 'react';
import { RadioGroup as ArkUiRadioGroup } from '@ark-ui/react/radio-group';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';

export type RadioProps = Omit<ArkUiRadioGroup.ItemProps, 'className'> & TestableProps;

export const Radio: FC<RadioProps> = ({ children, 'data-testid': testId, ...props }) => (
  <TestIdProvider value={testId}>
    <ArkUiRadioGroup.Item
      {...props}
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
        'data-disabled:**:pointer-events-none data-disabled:cursor-not-allowed',
      )}
    >
      {children}
      <ArkUiRadioGroup.ItemHiddenInput />
    </ArkUiRadioGroup.Item>
  </TestIdProvider>
);

Radio.displayName = 'Radio';
