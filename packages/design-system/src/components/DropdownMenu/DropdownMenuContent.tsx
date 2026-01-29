import type { ComponentPropsWithoutRef, ElementRef, FC, Ref } from 'react';

import { Content } from '@radix-ui/react-dropdown-menu';

import { cn } from '../../utils/cn';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';

import { dropdownMenuClassNames } from './classes';
import { DropdownMenuPortal } from './DropdownMenuPortal';

type DropdownMenuContentProps = ComponentPropsWithoutRef<typeof Content> & {
  ref?: Ref<ElementRef<typeof Content>>;
};

export const DropdownMenuContent: FC<DropdownMenuContentProps> = ({
  className,
  sideOffset = 4,
  children,
  ref,
  ...props
}) => (
  <DropdownMenuPortal>
    <Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={4}
      className={cn(
        dropdownMenuClassNames,
        'max-h-(--radix-dropdown-menu-content-available-height)',
        'origin-[--radix-dropdown-menu-content-transform-origin]',
        className,
      )}
      {...props}
      asChild
    >
      <ScrollArea>
        <ScrollAreaViewport>
          <ScrollAreaContent className={cn('flex flex-col gap-1')}>
            {children}
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar />
        <ScrollAreaCorner />
      </ScrollArea>
    </Content>
  </DropdownMenuPortal>
);

DropdownMenuContent.displayName = 'DropdownMenuContent';
