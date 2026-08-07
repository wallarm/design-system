import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';

export interface PopoverProps extends TestableProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Override the trigger element's id. Pass the same id to another
   * compound component's `ids.trigger` (e.g. `Tooltip`, `DropdownMenu`) to
   * compose their triggers on one element via nested `asChild` without an
   * extra wrapper node — otherwise the outer trigger's id wins and the
   * other component can't find its own anchor.
   */
  ids?: ArkUiPopover.RootProps['ids'];
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
  ids,
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
        ids={ids}
        lazyMount
        unmountOnExit
      >
        {children}
      </ArkUiPopover.Root>
    </TestIdProvider>
  );
};

Popover.displayName = 'Popover';
