import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react';
import { TestIdProvider } from '../../utils/testId';

export interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  'data-testid'?: string;
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
  'data-testid': testId,
}) => {
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
