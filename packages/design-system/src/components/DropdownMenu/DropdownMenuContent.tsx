import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { Portal } from '@ark-ui/react/portal';
import { cn } from '../../utils/cn';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';
import { dropdownMenuClassNames } from './classes';

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  footer?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuContent: FC<DropdownMenuContentProps> = ({
  className,
  children,
  footer,
  ref,
  ...props
}) => (
  <Portal>
    <Menu.Positioner>
      <Menu.Content
        ref={ref}
        className={cn(
          dropdownMenuClassNames,
          'max-h-(--available-height)',
          'origin-[--transform-origin]',
          footer && '!overflow-y-hidden',
          className,
        )}
        {...props}
      >
        <ScrollArea className={cn('flex flex-col min-h-0')} style={{ position: 'static' }}>
          <ScrollAreaViewport>
            <ScrollAreaContent className={cn('flex flex-col gap-1')}>{children}</ScrollAreaContent>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar />
          <ScrollAreaCorner />
        </ScrollArea>
        {footer}
      </Menu.Content>
    </Menu.Positioner>
  </Portal>
);

DropdownMenuContent.displayName = 'DropdownMenuContent';
