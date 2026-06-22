import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { type TestableProps, useTestId } from '../../utils/testId';

export interface DrawerTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>,
    TestableProps {
  children: ReactNode;
  /** Render as child component */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const DrawerTrigger: FC<DrawerTriggerProps> = ({
  children,
  asChild = false,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('trigger', testIdProp);

  return (
    <Dialog.Trigger {...rest} ref={ref} data-testid={testId} asChild={asChild}>
      {children}
    </Dialog.Trigger>
  );
};

DrawerTrigger.displayName = 'DrawerTrigger';
