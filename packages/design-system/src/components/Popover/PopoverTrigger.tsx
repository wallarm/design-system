import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { type TestableProps, useTestId } from '../../utils/testId';

export interface PopoverTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>,
    TestableProps {
  children: ReactNode;
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const PopoverTrigger: FC<PopoverTriggerProps> = ({
  asChild = false,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('trigger', testIdProp);

  return <ArkUiPopover.Trigger {...props} asChild={asChild} data-testid={testId} />;
};

PopoverTrigger.displayName = 'PopoverTrigger';
