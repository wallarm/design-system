import { type FC, type PropsWithChildren, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { cn } from '../../utils/cn';
import { HStack, VStack } from '../Stack';
import { ScrollArea } from './ScrollArea';
import { ScrollAreaContent } from './ScrollAreaContent';
import { ScrollAreaCorner } from './ScrollAreaCorner';
import { ScrollAreaScrollbar } from './ScrollAreaScrollbar';
import { ScrollAreaViewport } from './ScrollAreaViewport';

const DESCRIPTION = [
  'A scroll container with the house scrollbar instead of the browser’s: compose `ScrollAreaViewport` › `ScrollAreaContent`, then one `ScrollAreaScrollbar` per axis and a `ScrollAreaCorner` where two of them meet.',
  'It can only scroll inside a bounded parent, so give the wrapper a height or a width — with nothing to overflow, the content simply grows.',
].join(' ');

const meta = {
  title: 'Layout/ScrollArea',
  component: ScrollArea,
  subcomponents: {
    ScrollAreaViewport,
    ScrollAreaContent,
    ScrollAreaScrollbar,
    ScrollAreaCorner,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;

const Box: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div
    className={cn(
      'flex py-4 px-8 items-center justify-center rounded-6 border border-border-info bg-bg-light-info font-mono text-xs text-text-info',
      className,
    )}
  >
    {children}
  </div>
);

/** The default vertical bar, inside a 320px box that gives the fifty rows something to overflow. */
export const Vertical: StoryFn<typeof meta> = () => (
  <div className='w-320 h-320 overflow-hidden'>
    <ScrollArea>
      <ScrollAreaViewport>
        <ScrollAreaContent>
          <VStack>
            {new Array(50).fill(null).map((_, index) => {
              const value = `${index + 1}`;

              return (
                <Box key={value} className='h-40 w-full'>
                  {value}
                </Box>
              );
            })}
          </VStack>
        </ScrollAreaContent>
      </ScrollAreaViewport>

      <ScrollAreaScrollbar />

      <ScrollAreaCorner />
    </ScrollArea>
  </div>
);

/** `orientation='horizontal'` puts the bar along the bottom edge, for a row that runs past its container rather than a column that runs below it. */
export const Horizontal: StoryFn<typeof meta> = () => (
  <div className='w-320 h-320 overflow-hidden'>
    <ScrollArea>
      <ScrollAreaViewport>
        <ScrollAreaContent>
          <HStack>
            {new Array(50).fill(null).map((_, index) => {
              const value = `${index + 1}`;

              return (
                <Box key={value} className='h-320 w-40'>
                  {value}
                </Box>
              );
            })}
          </HStack>
        </ScrollAreaContent>
      </ScrollAreaViewport>

      <ScrollAreaScrollbar orientation='horizontal' />

      <ScrollAreaCorner />
    </ScrollArea>
  </div>
);

/**
 * `ScrollAreaViewport` forwards its `ref` to the scrolling element itself, so a row
 * virtualiser such as `@tanstack/react-virtual` can track scroll position inside the
 * house scrollbar instead of falling back to a bare `overflow-y: auto` div. Ten thousand
 * rows here, a few dozen in the DOM.
 *
 * Two things this story is deliberately showing:
 *
 * - `useVirtualizer` is called in the same component that declares the ref. Called from a
 *   component rendered *inside* the viewport, `getScrollElement()` runs once — before React
 *   has attached the host element's ref — returns `null`, and nothing ever re-runs it, so the
 *   list stays permanently empty.
 * - `ScrollAreaContent` gets `h-auto min-h-full` so it grows with the virtual sizer. The
 *   scrollbar is only rendered while the viewport reports `data-overflow-y`, and that flag is
 *   recomputed from a `ResizeObserver` watching the content box — which at its default `h-full`
 *   stays the height of the viewport. A list that grows *after* mount therefore keeps its
 *   scrollbar hidden until something else forces a remeasure.
 */
export const Virtualized: StoryFn<typeof meta> = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: 10_000,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 44,
    overscan: 8,
  });

  return (
    <div className='w-320 h-320 overflow-hidden'>
      <ScrollArea>
        <ScrollAreaViewport ref={scrollRef}>
          <ScrollAreaContent className='h-auto min-h-full'>
            <div className='relative w-full' style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map(item => (
                <div
                  key={item.key}
                  className='absolute top-0 left-0 w-full pb-4'
                  style={{ height: item.size, transform: `translateY(${item.start}px)` }}
                >
                  <Box className='h-full w-full'>{item.index + 1}</Box>
                </div>
              ))}
            </div>
          </ScrollAreaContent>
        </ScrollAreaViewport>

        <ScrollAreaScrollbar />

        <ScrollAreaCorner />
      </ScrollArea>
    </div>
  );
};
