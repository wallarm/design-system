import type { FC, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';

export interface DrawerBodyProps {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const DrawerBody: FC<DrawerBodyProps> = ({ children, ref }) => (
  <ScrollArea className={cn('flex-1 min-h-0')} data-slot='drawer-body'>
    <ScrollAreaViewport ref={ref}>
      <ScrollAreaContent
        className={cn('flex flex-col px-24')}
        data-slot='drawer-scroll-area-content'
      >
        {children}
      </ScrollAreaContent>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar />
  </ScrollArea>
);

DrawerBody.displayName = 'DrawerBody';
