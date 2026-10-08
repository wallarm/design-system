import { type FC, type ReactNode, useRef } from 'react';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { Popover, type PopoverProps } from '../Popover';
import { OverflowListMoreTriggerRefProvider, useOverflowListContext } from './OverflowListContext';
import { OverflowListMoreContent } from './OverflowListMoreContent';
import { OverflowListMoreTrigger } from './OverflowListMoreTrigger';

export interface OverflowListMoreProps
  extends Pick<PopoverProps, 'open' | 'onOpenChange'>,
    TestableProps {
  /**
   * Defaults to `<OverflowListMoreTrigger />` + `<OverflowListMoreContent />`.
   * Compose from the `OverflowListMore*` parts only — they know to render a bare
   * chip in the hidden measurement layer, where there is no popover root.
   */
  children?: ReactNode;
  /**
   * `trigger` — the popover opens below the "+N" chip.
   * `cover` — the popover opens over the row, from the list's left edge.
   */
  placement?: 'trigger' | 'cover';
}

const DEFAULT_CHILDREN = (
  <>
    <OverflowListMoreTrigger />
    <OverflowListMoreContent />
  </>
);

export const OverflowListMore: FC<OverflowListMoreProps> = ({
  children = DEFAULT_CHILDREN,
  placement = 'trigger',
  open,
  onOpenChange,
  'data-testid': testIdProp,
}) => {
  const { hiddenItems, containerRef, measuring, testId: listTestId } = useOverflowListContext();
  const testId = testIdProp ?? (listTestId ? `${listTestId}--more` : undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The measurement layer only needs the chip's width: no popover, no test ids.
  if (measuring) return <TestIdProvider value={undefined}>{children}</TestIdProvider>;
  if (hiddenItems.length === 0) return null;

  // Read lazily by floating-ui on every position update, never during render.
  const positioning: PopoverProps['positioning'] =
    placement === 'cover'
      ? {
          placement: 'bottom-start',
          gutter: 0,
          offset: { mainAxis: 0, crossAxis: 0 },
          getAnchorElement: () => {
            const container = containerRef.current;
            if (!container) return null;
            return {
              contextElement: container,
              getBoundingClientRect: () => {
                const row = container.getBoundingClientRect();
                // Align with the chip's top; a custom trigger falls back to the row's.
                const top = triggerRef.current?.getBoundingClientRect().top ?? row.top;
                return new DOMRect(row.left, top, row.width, 0);
              },
            };
          },
        }
      : undefined;

  return (
    <OverflowListMoreTriggerRefProvider value={triggerRef}>
      <Popover
        open={open}
        onOpenChange={onOpenChange}
        positioning={positioning}
        data-testid={testId}
      >
        {children}
      </Popover>
    </OverflowListMoreTriggerRefProvider>
  );
};

OverflowListMore.displayName = 'OverflowListMore';
