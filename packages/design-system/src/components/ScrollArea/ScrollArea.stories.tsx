import type { FC, PropsWithChildren } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { cn } from '../../utils/cn';
import { HStack, VStack } from '../Stack';
import { ScrollArea } from './ScrollArea';
import { ScrollAreaContent } from './ScrollAreaContent';
import { ScrollAreaCorner } from './ScrollAreaCorner';
import { ScrollAreaScrollbar } from './ScrollAreaScrollbar';
import { ScrollAreaViewport } from './ScrollAreaViewport';

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
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;

const Box: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div
    className={cn(
      'flex py-4 px-8 items-center justify-center bg-blue-500 text-white rounded',
      className,
    )}
  >
    {children}
  </div>
);

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
