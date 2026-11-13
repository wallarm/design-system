import { type FC, type ReactNode, useId, useLayoutEffect, useState } from 'react';
import { HoverCard as ArkUiHoverCard } from '@ark-ui/react/hover-card';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { SuppressTooltipsContext } from '../Tooltip/Tooltip';
import { HoverCardReopenContext, HoverCardTriggerSideContext } from './HoverCardContext';

/**
 * Root. Renders no DOM. Pinned: openDelay 600 (0 while the exit animation still plays, so coming
 * back reopens the fading card), closeDelay 300, lazyMount, unmountOnExit,
 * positioning { placement: 'bottom-start', offset: { mainAxis: 12 } }.
 * While the card is up, every Tooltip under the root outside HoverCardContent is held closed (an
 * open one fades out as the card fades in), so a tooltip on the trigger never covers it. Put the
 * `<Tooltip>` root inside `<HoverCard>`, or it is not held. AvatarName on the trigger side drops
 * its overflow tooltip: the card shows the full name.
 */
export interface HoverCardProps extends TestableProps {
  children: ReactNode;
  /** Controlled. Pass `open` only together with `onOpenChange` feeding it back, or the card never moves (zag controlled mode). */
  open?: boolean;
  /** Ark's details are unwrapped to a boolean, as in Popover. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Override the trigger element's id. Pass the same id to a `Tooltip`'s `ids.trigger` to
   * compose both triggers on one element via nested `asChild` without an extra wrapper node —
   * otherwise the outer trigger's id wins and the other component can't find its own anchor.
   */
  ids?: ArkUiHoverCard.RootProps['ids'];
}

const HOVER_CARD_POSITIONING: ArkUiHoverCard.RootProps['positioning'] = {
  placement: 'bottom-start',
  offset: { mainAxis: 12 },
};

export const HoverCard: FC<HoverCardProps> = ({
  children,
  open,
  onOpenChange,
  ids,
  'data-testid': testIdProp,
}) => {
  const inheritedTestId = useTestId();
  const testId = testIdProp ?? inheritedTestId;
  // Our own content id, so the root can find the content node (by id, as zag does).
  const fallbackContentId = useId();
  const contentId = ids?.content ?? fallbackContentId;
  // From close until the exit animation ends (the content is still on screen, fading).
  const [exiting, setExiting] = useState(false);
  const [reopenFrom, setReopenFrom] = useState<Keyframe | null>(null);

  const handleOpenChange = ({ open }: ArkUiHoverCard.OpenChangeDetails) => {
    const content = document.getElementById(contentId);
    if (open && exiting && content) {
      // Still the exit's frame: zag calls this before React renders data-state=open.
      const { opacity, transform } = getComputedStyle(content);
      setReopenFrom({ opacity, transform });
    } else {
      setReopenFrom(null);
    }
    // A close from the open delay (never shown) has no content and no exit to wait for.
    setExiting(!open && content !== null);
    onOpenChange?.(open);
  };

  const handleExitComplete = () => {
    setExiting(false);
    setReopenFrom(null);
  };

  // Reopened mid-exit: go up from the exit's frame before the first paint, so the fading card
  // turns back instead of blinking to 0. HoverCardContent has its CSS enter off meanwhile.
  useLayoutEffect(() => {
    if (!reopenFrom) return;
    document.getElementById(contentId)?.animate?.([reopenFrom, { opacity: 1, transform: 'none' }], {
      duration: 150,
      easing: 'ease',
    });
  }, [reopenFrom, contentId]);

  return (
    <TestIdProvider value={testId}>
      <ArkUiHoverCard.Root
        openDelay={exiting ? 0 : 600}
        closeDelay={300}
        positioning={HOVER_CARD_POSITIONING}
        open={open}
        onOpenChange={handleOpenChange}
        onExitComplete={handleExitComplete}
        ids={{ ...ids, content: contentId }}
        lazyMount
        unmountOnExit
      >
        <ArkUiHoverCard.Context>
          {api => (
            <SuppressTooltipsContext.Provider value={api.open || exiting}>
              <HoverCardReopenContext.Provider value={reopenFrom}>
                <HoverCardTriggerSideContext.Provider value>
                  {children}
                </HoverCardTriggerSideContext.Provider>
              </HoverCardReopenContext.Provider>
            </SuppressTooltipsContext.Provider>
          )}
        </ArkUiHoverCard.Context>
      </ArkUiHoverCard.Root>
    </TestIdProvider>
  );
};

HoverCard.displayName = 'HoverCard';
