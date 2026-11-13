import { createContext, type FC, type ReactNode, useContext } from 'react';
import { Tooltip as ArkUiTooltip } from '@ark-ui/react/tooltip';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';

export interface TooltipProps extends TestableProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  closeOnPointerDown?: boolean;
  closeOnEscape?: boolean;
  closeOnScroll?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  positioning?: ArkUiTooltip.RootProps['positioning'];
  /**
   * Override the trigger element's id. Pass the same id to another
   * compound component's `ids.trigger` (e.g. `Popover`, `DropdownMenu`) to
   * compose their triggers on one element via nested `asChild` without an
   * extra wrapper node — otherwise the outer trigger's id wins and this
   * tooltip can't find its anchor, mispositioning at the viewport origin.
   */
  ids?: ArkUiTooltip.RootProps['ids'];
}

/**
 * Internal, not exported from index.ts. `true` holds every Tooltip below it closed; an open one
 * fades out as usual. HoverCard provides it on its trigger side while the card is up, so a
 * tooltip on or around the trigger never sits on top of the card; HoverCardContent resets it to
 * `false` for the tooltips inside the card.
 */
export const SuppressTooltipsContext = createContext(false);

const TOOLTIP_POSITIONING_DEFAULT: ArkUiTooltip.RootProps['positioning'] = {
  offset: {
    mainAxis: 6,
  },
  overflowPadding: 8,
};

export const Tooltip: FC<TooltipProps> = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  openDelay,
  closeDelay,
  closeOnPointerDown,
  closeOnEscape,
  closeOnScroll,
  interactive,
  disabled,
  positioning,
  ids,
  'data-testid': testIdProp,
}) => {
  const inheritedTestId = useTestId();
  const testId = testIdProp ?? inheritedTestId;
  const suppressed = useContext(SuppressTooltipsContext);

  const handleOpenChange = (details: ArkUiTooltip.OpenChangeDetails) => {
    if (suppressed) return;
    onOpenChange?.(details.open);
  };

  return (
    <TestIdProvider value={testId}>
      <ArkUiTooltip.Root
        // Held closed rather than `disabled`: a disabled tooltip ignores the pointer leaving, keeps
        // zag's hasPointerMoveOpened set and never opens on that trigger again.
        open={suppressed ? false : open}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
        openDelay={openDelay}
        closeDelay={closeDelay}
        closeOnPointerDown={closeOnPointerDown}
        closeOnEscape={closeOnEscape}
        closeOnScroll={closeOnScroll}
        interactive={interactive}
        disabled={disabled}
        positioning={positioning ?? TOOLTIP_POSITIONING_DEFAULT}
        ids={ids}
        lazyMount
        unmountOnExit
      >
        {children}
      </ArkUiTooltip.Root>
    </TestIdProvider>
  );
};

Tooltip.displayName = 'Tooltip';
