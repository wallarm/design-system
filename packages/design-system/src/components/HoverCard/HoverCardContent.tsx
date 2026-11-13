import { type FC, type HTMLAttributes, type ReactNode, type Ref, useContext } from 'react';
import { HoverCard as ArkUiHoverCard, useHoverCardContext } from '@ark-ui/react/hover-card';
import { Portal as ArkUiPortal } from '../../lib/portal/Portal';
import { cn } from '../../utils/cn';
import { useLayerZIndexRef } from '../../utils/syncLayerZIndex';
import { type TestableProps, useTestId } from '../../utils/testId';
import { popoverSurfaceClassNames } from '../Popover/classes';
import { SuppressTooltipsContext } from '../Tooltip/Tooltip';
import { HoverCardReopenContext, HoverCardTriggerSideContext } from './HoverCardContext';

export interface HoverCardContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'style'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/** Portal > Positioner > Content: the 320 px card surface. */
export const HoverCardContent: FC<HoverCardContentProps> = ({
  ref,
  children,
  className,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('content', testIdProp);
  const { getContentProps } = useHoverCardContext();
  const { id } = getContentProps();
  const reopenFrom = useContext(HoverCardReopenContext);
  const contentRef = useLayerZIndexRef<HTMLDivElement>(ref);

  return (
    <ArkUiPortal>
      <ArkUiHoverCard.Positioner>
        <ArkUiHoverCard.Content
          {...rest}
          ref={contentRef}
          id={id}
          data-slot='hover-card-content'
          data-testid={testId}
          className={cn(
            popoverSurfaceClassNames,
            // `!`: plain animate-none loses to data-[state=closed]:animate-out, so the close still faded.
            'w-320 max-w-(--available-width) flex flex-col gap-6 motion-reduce:animate-none!',
            // Reopened mid-exit: HoverCard animates it from the exit's frame instead.
            reopenFrom && 'animate-none!',
            className,
          )}
        >
          {/* Inside the card tooltips stay live: only the trigger side is suppressed. */}
          <SuppressTooltipsContext.Provider value={false}>
            <HoverCardTriggerSideContext.Provider value={false}>
              {children}
            </HoverCardTriggerSideContext.Provider>
          </SuppressTooltipsContext.Provider>
        </ArkUiHoverCard.Content>
      </ArkUiHoverCard.Positioner>
    </ArkUiPortal>
  );
};

HoverCardContent.displayName = 'HoverCardContent';
