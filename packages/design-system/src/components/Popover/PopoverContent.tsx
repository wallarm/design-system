import {
  type CSSProperties,
  type FC,
  type MouseEvent,
  type ReactNode,
  useMemo,
} from 'react';

import { Popover as ArkUiPopover, usePopoverContext } from '@ark-ui/react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';

import { cn } from '../../utils/cn';
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

interface PopoverContentProps {
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
}) => {
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

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <ArkUiPortal>
      <ArkUiPopover.Positioner>
        <ArkUiPopover.Content
          id={id}
          style={style}
          className={cn(
            // Layout
            'flex flex-col',
            'min-w-(--popover-min-width)',
            'max-w-[clamp(var(--popover-min-width),var(--available-width),var(--popover-max-width))]',
            'min-h-(--popover-min-height)',
            'max-h-[clamp(var(--popover-min-height),var(--available-height),var(--popover-max-height))]',
            // Visual
            'p-12 bg-bg-surface-2 rounded-12 border border-border-primary-light shadow-md',
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
          )}
          onClick={handleClick}
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
