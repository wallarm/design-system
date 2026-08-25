import type { FC, PropsWithChildren } from 'react';
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
