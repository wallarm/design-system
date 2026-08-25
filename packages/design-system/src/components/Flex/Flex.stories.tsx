import type { FC, PropsWithChildren } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { cn } from '../../utils/cn';
import { VStack } from '../Stack';
import { Flex } from './Flex';

const Box: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div
    className={cn(
      'flex h-40 py-4 px-8 items-center justify-center bg-blue-500 text-white rounded',
      className,
    )}
  >
    {children}
  </div>
);

const DESCRIPTION = [
  'A flex container with the properties as props — `direction`, `justify`, `align`, `wrap`, plus `basis` fractions and `grow` / `shrink` for how the children size themselves.',
  'Reach for `Stack`, or `HStack` / `VStack`, when all you want is a spaced list in one direction: `Stack` carries a default gap where `Flex` has none. `Flex` takes no `className`, so everything goes through props.',
].join(' ');

const meta = {
  title: 'Layout/Flex',
  component: Flex,
  args: {},
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Flex>;

export default meta;

/** A row of three, which is the default direction. There is no gap until you ask for one. */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex {...args} gap={4}>
    <Box>A</Box>
    <Box>B</Box>
    <Box>C</Box>
  </Flex>
);

/** `row`, `column` and `row-reverse`. Reverse changes the paint order without touching the DOM order, so it moves the visual sequence away from the tab order — use it sparingly. */
export const Direction: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <VStack>
      <p className='sb-annotation'>row — default</p>
      <Flex {...args} direction='row' gap={2}>
        <Box className='h-32 py-2 px-4 text-sm'>1</Box>
        <Box className='h-32 py-2 px-4 text-sm'>2</Box>
        <Box className='h-32 py-2 px-4 text-sm'>3</Box>
      </Flex>
    </VStack>

    <VStack>
      <p className='sb-annotation'>column</p>
      <Flex {...args} direction='column' gap={2}>
        <Box className='h-32 py-2 px-4 text-sm'>1</Box>
        <Box className='h-32 py-2 px-4 text-sm'>2</Box>
        <Box className='h-32 py-2 px-4 text-sm'>3</Box>
      </Flex>
    </VStack>

    <VStack>
      <p className='sb-annotation'>row-reverse</p>
      <Flex {...args} direction='row-reverse' gap={2}>
        <Box className='h-32 py-2 px-4 text-sm'>1</Box>
        <Box className='h-32 py-2 px-4 text-sm'>2</Box>
        <Box className='h-32 py-2 px-4 text-sm'>3</Box>
      </Flex>
    </VStack>
  </Flex>
);

/** `justify` distributes along the main axis, and needs `fullWidth` (or a sized parent) to have any room to distribute in. */
export const Alignment: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <VStack>
      <p className='sb-annotation'>justify start — default</p>
      <Flex {...args} justify='start' fullWidth>
        <Box className='h-16 w-16 text-xs'>A</Box>
        <Box className='h-16 w-16 text-xs'>B</Box>
      </Flex>
    </VStack>

    <VStack>
      <p className='sb-annotation'>justify center</p>
      <Flex {...args} justify='center' fullWidth>
        <Box className='h-16 w-16 text-xs'>A</Box>
        <Box className='h-16 w-16 text-xs'>B</Box>
      </Flex>
    </VStack>

    <VStack>
      <p className='sb-annotation'>justify between</p>
      <Flex {...args} justify='between' fullWidth>
        <Box className='h-16 w-16 text-xs'>A</Box>
        <Box className='h-16 w-16 text-xs'>B</Box>
      </Flex>
    </VStack>
  </Flex>
);

/** `wrap` lets the row break onto more lines once it runs out of width, which is what keeps a long row of chips or tags from overflowing. */
export const Wrap: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack>
    <p className='sb-annotation'>wrap</p>
    <Flex {...args} wrap='wrap' gap={2} fullWidth>
      {new Array(40).fill(null).map((_, index) => {
        const key = `${index + 1}`;

        return (
          <Box className='h-20 w-20 text-xs' key={key}>
            {key}
          </Box>
        );
      })}
    </Flex>
  </VStack>
);

/** How the children behave when the space does not fit: growing to fill it, or shrinking to survive it. `basis` is the third lever, for a child that should start at a fraction of the row. */
export const GrowShrink: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <VStack>
      <p className='sb-annotation'>grow</p>
      <Flex {...args} fullWidth>
        <Box className='h-16 flex-1 text-xs'>Flex-1</Box>
        <Box className='h-16 flex-1 text-xs'>Flex-1</Box>
        <Box className='h-16 text-xs'>Fixed</Box>
      </Flex>
    </VStack>

    <VStack>
      <p className='sb-annotation'>shrink</p>
      <Flex {...args} fullWidth>
        <Box className='h-16 flex-shrink text-xs'>Shrinkable long content</Box>
        <Box className='h-16 flex-shrink-0 text-xs'>No shrink</Box>
      </Flex>
    </VStack>
  </Flex>
);
