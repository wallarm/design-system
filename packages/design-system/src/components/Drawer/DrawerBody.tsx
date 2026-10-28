import type { FC, ReactNode, Ref } from 'react';

import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
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

export const DrawerBody: FC<DrawerBodyProps> = ({ children, ref }) => {
  const testId = useTestId('body');

  return (
    <ScrollArea className={cn('min-h-0 flex-1')} data-slot='drawer-body' data-testid={testId}>
      <ScrollAreaViewport ref={ref}>
        <ScrollAreaContent
          className={cn('flex h-auto min-h-full flex-col px-24')}
          data-slot='drawer-scroll-area-content'
        >
          {children}
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar />
    </ScrollArea>
  );
};

DrawerBody.displayName = 'DrawerBody';
