import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';

export interface PopoverProps extends TestableProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const POPOVER_POSITIONING_DEFAULT: ArkUiPopover.RootProps['positioning'] = {
  gutter: 8,
  offset: {
    mainAxis: 12,
  },
};

export const Popover: FC<PopoverProps> = ({
  children,
  open,
  onOpenChange,
  'data-testid': testIdProp,
}) => {
  const inheritedTestId = useTestId();
  const testId = testIdProp ?? inheritedTestId;

  const handleOpenChange = ({ open }: ArkUiPopover.OpenChangeDetails) => {
    onOpenChange?.(open);
  };

  return (
    <TestIdProvider value={testId}>
      <ArkUiPopover.Root
        positioning={POPOVER_POSITIONING_DEFAULT}
        open={open}
        onOpenChange={handleOpenChange}
        lazyMount
        unmountOnExit
      >
        {children}
      </ArkUiPopover.Root>
    </TestIdProvider>
  );
};

Popover.displayName = 'Popover';
