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

/**
 * The drawer's vertically scrolling body. Its content must fit the drawer's width: a long value
 * truncates, and anything genuinely wider (a chart, a fixed-width block) brings its own
 * `overflow-x-auto` container — Table, CodeSnippet and CodeEditor already do.
 */
export const DrawerBody: FC<DrawerBodyProps> = ({ children, ref }) => {
  const testId = useTestId('body');

  return (
    <ScrollArea className={cn('flex-1 min-h-0')} data-slot='drawer-body' data-testid={testId}>
      <ScrollAreaViewport ref={ref}>
        <ScrollAreaContent
          // zag gives scroll-area content an inline `min-width: fit-content`. A drawer has a fixed
          // width, so its body must not grow with its widest line — otherwise a long value widens
          // the whole body instead of truncating.
          className={cn('flex flex-col px-24 min-h-full h-auto min-w-0!')}
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
