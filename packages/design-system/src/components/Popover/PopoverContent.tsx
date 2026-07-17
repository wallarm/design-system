import { type CSSProperties, type FC, type HTMLAttributes, type ReactNode, useMemo } from 'react';
import { Popover as ArkUiPopover, usePopoverContext } from '@ark-ui/react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';
import {
  POPOVER_MAX_HEIGHT,
  POPOVER_MAX_WIDTH,
  POPOVER_MIN_HEIGHT,
  POPOVER_MIN_WIDTH,
} from './constants';
import type { PopoverSizeDimension } from './types';

export interface PopoverContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'style'>,
    TestableProps {
  children: ReactNode;
  minHeight?: PopoverSizeDimension;
  maxHeight?: PopoverSizeDimension;
  minWidth?: PopoverSizeDimension;
  maxWidth?: PopoverSizeDimension;
}

export const PopoverContent: FC<PopoverContentProps> = ({
  children,
  minHeight = POPOVER_MIN_HEIGHT,
  maxHeight = POPOVER_MAX_HEIGHT,
  minWidth = POPOVER_MIN_WIDTH,
  maxWidth = POPOVER_MAX_WIDTH,
  className,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('content', testIdProp);
  const { getContentProps } = usePopoverContext();
  const { id } = getContentProps();

  const style = useMemo(
    () =>
      ({
        '--popover-min-height': minHeight,
        '--popover-max-height': maxHeight,
        '--popover-min-width': minWidth,
        '--popover-max-width': maxWidth,
      }) as CSSProperties,
    [minHeight, maxHeight, minWidth, maxWidth],
  );

  return (
    <ArkUiPortal>
      <ArkUiPopover.Positioner>
        <ArkUiPopover.Content
          {...rest}
          id={id}
          data-testid={testId}
          style={style}
          className={cn(
            // Layout
            'flex flex-col',
            'min-w-(--popover-min-width)',
            'max-w-[clamp(var(--popover-min-width),var(--available-width),var(--popover-max-width))]',
            'min-h-(--popover-min-height)',
            'max-h-[clamp(var(--popover-min-height),var(--available-height),var(--popover-max-height))]',
            // Visual
            'p-12 bg-bg-surface-2 rounded-12 border border-border-primary-light shadow-md text-text-primary',
            // Leveling: layer-aware so a popover opened inside a nested
            // drawer/dialog stacks above that dialog's positioner — zag sets
            // --layer-index inline on this node when the popover opens, and
            // popper mirrors the computed z-index into the positioner's
            // --z-index (same mechanism as DropdownMenu/Select, see
            // DropdownMenu/classes.ts).
            'z-[calc(var(--drawer-positioner-z-index)+(var(--layer-index,0)*var(--drawer-level-ratio)))]',
            // Contain wheel chaining on the inner ScrollArea viewport so wheel
            // events past the scroll boundary don't propagate to whatever
            // scrollable lives below — popovers are portaled and frequently
            // open above a non-modal surface (e.g. a `modal={false}` Drawer),
            // where chained scroll would otherwise move the page underneath.
            '[&_[data-part=viewport]]:overscroll-contain',
            // Animations
            'animate-in fade-in-0 zoom-in-95 origin-[--radix-tooltip-content-transform-origin]',
            // Animation closed
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            // Animation bottom
            'data-[side=bottom]:slide-in-from-top-2',
            // Animation left
            'data-[side=left]:slide-in-from-right-2',
            // Animation right
            'data-[side=right]:slide-in-from-left-2',
            // Animation top
            'data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          asChild
        >
          <ScrollArea ids={{ root: id }}>
            <ScrollAreaViewport>
              <ScrollAreaContent>{children}</ScrollAreaContent>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar />
          </ScrollArea>
        </ArkUiPopover.Content>
      </ArkUiPopover.Positioner>
    </ArkUiPortal>
  );
};

PopoverContent.displayName = 'PopoverContent';
