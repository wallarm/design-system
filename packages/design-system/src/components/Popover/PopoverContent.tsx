import {
  type CSSProperties,
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useMemo,
} from 'react';
import { Popover as ArkUiPopover, usePopoverContext } from '@ark-ui/react';
import { Portal as ArkUiPortal } from '../../lib/portal/Portal';
import { cn } from '../../utils/cn';
import { useLayerZIndexRef } from '../../utils/syncLayerZIndex';
import { type TestableProps, useTestId } from '../../utils/testId';
import { popoverSurfaceClassNames } from './classes';
import { POPOVER_MAX_HEIGHT, POPOVER_MAX_WIDTH, POPOVER_MIN_WIDTH } from './constants';
import type { PopoverSizeDimension } from './types';

export interface PopoverContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'style'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
  minHeight?: PopoverSizeDimension;
  maxHeight?: PopoverSizeDimension;
  minWidth?: PopoverSizeDimension;
  maxWidth?: PopoverSizeDimension;
}

export const PopoverContent: FC<PopoverContentProps> = ({
  ref,
  children,
  minHeight,
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
  const contentRef = useLayerZIndexRef<HTMLDivElement>(ref);

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
          // Before the spread so wrappers (e.g. ChatPermissionsContent) can set their own slot.
          data-slot='popover-content'
          {...rest}
          ref={contentRef}
          id={id}
          data-testid={testId}
          style={style}
          className={cn(
            // Layout
            'flex flex-col overflow-auto',
            'min-w-(--popover-min-width)',
            'max-w-[clamp(var(--popover-min-width),var(--available-width),var(--popover-max-width))]',
            'min-h-(--popover-min-height)',
            'max-h-[clamp(var(--popover-min-height,0px),var(--available-height),var(--popover-max-height))]',
            popoverSurfaceClassNames,
            className,
          )}
        >
          {children}
        </ArkUiPopover.Content>
      </ArkUiPopover.Positioner>
    </ArkUiPortal>
  );
};

PopoverContent.displayName = 'PopoverContent';
