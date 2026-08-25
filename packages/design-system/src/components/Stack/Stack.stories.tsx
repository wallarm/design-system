import type { ReactNode } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Flex } from '../Flex';
import { HStack } from './HStack';
import { Stack } from './Stack';
import { VStack } from './VStack';

const Box = ({ children }: { children: ReactNode }) => (
  <div className='flex h-24 w-24 items-center justify-center rounded-6 border border-border-info bg-bg-light-info font-mono text-xs text-text-info'>
    {children}
  </div>
);

const DESCRIPTION = [
  'A column or row of children with a gap from the spacing scale — `gap` defaults to 4, which is the practical difference from `Flex`.',
  'Reach for `VStack` or `HStack` rather than `Stack` with a `direction`: they read better in a tree, and `HStack` centres its items for you. Children have to be elements — a bare string is dropped rather than rendered.',
].join(' ');

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  args: {},
} satisfies Meta<typeof Stack>;

export default meta;

/** The bare `Stack`: a column, because that is its default direction, with the default gap already applied. */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Stack {...args} gap={4}>
    <Box>A</Box>
    <Box>B</Box>
    <Box>C</Box>
  </Stack>
);

/** `VStack` and `HStack` are the same component with the direction fixed — and `HStack` also switches `align` to `center`, since a row of mixed heights almost always wants that. */
export const Direction: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <Flex direction='column'>
      <p className='sb-annotation'>VStack</p>
      <VStack {...args} gap={4}>
        <Box>1</Box>
        <Box>2</Box>
        <Box>3</Box>
      </VStack>
    </Flex>

    <Flex direction='column'>
      <p className='sb-annotation'>HStack</p>
      <HStack {...args} gap={4}>
        <Box>1</Box>
        <Box>2</Box>
        <Box>3</Box>
      </HStack>
    </Flex>
  </Flex>
);

/** `align` positions the children across the stack, not along it: in a column that is left, centre and right. */
export const Alignment: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <Flex direction='column'>
      <p className='sb-annotation'>align start</p>
      <VStack {...args} align='start'>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>

    <Flex direction='column'>
      <p className='sb-annotation'>align center</p>
      <VStack {...args} align='center'>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>

    <Flex direction='column'>
      <p className='sb-annotation'>align end</p>
      <VStack {...args} align='end'>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>
  </Flex>
);

/** `gap` takes the spacing scale rather than a free number, which is what keeps rhythm consistent between two screens built by two people. */
export const Spacing: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <Flex direction='column'>
      <p className='sb-annotation'>gap 2</p>
      <VStack {...args} gap={2}>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>

    <Flex direction='column'>
      <p className='sb-annotation'>gap 4</p>
      <VStack {...args} gap={4}>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>

    <Flex direction='column'>
      <p className='sb-annotation'>gap 8</p>
      <VStack {...args} gap={8}>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>
  </Flex>
);

/** With `wrap`, a row that runs out of width breaks onto the next line instead of overflowing its container. */
export const Wrap: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column'>
    <p className='sb-annotation'>wrap</p>
    <HStack {...args} gap={2} wrap='wrap'>
      {new Array(40).fill(null).map((_, index) => {
        const key = `${index + 1}`;

        return <Box key={key}>{key}</Box>;
      })}
    </HStack>
  </Flex>
);

/** The four sizing knobs against a fixed parent: `fullWidth` fills it, `flexGrow` takes the leftover space, and `flexShrink={false}` refuses to be squeezed — which is what makes the last row overflow on purpose. */
export const FlexBehavior: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <Flex direction='column'>
      <p className='sb-annotation'>default</p>
      <HStack {...args} gap={4}>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </HStack>
    </Flex>

    <Flex direction='column'>
      <p className='sb-annotation'>fullWidth</p>
      <HStack {...args} gap={4} fullWidth>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </HStack>
    </Flex>

    <Flex direction='column'>
      <p className='sb-annotation'>flexGrow</p>
      <HStack>
        <VStack {...args} gap={4} flexGrow>
          <Box>A</Box>
          <Box>B</Box>
        </VStack>
        <VStack {...args} gap={4}>
          <Box>C</Box>
        </VStack>
      </HStack>
    </Flex>

    <Flex direction='column'>
      <p className='sb-annotation'>flexShrink false</p>
      <div className='w-48 overflow-hidden border border-gray-300 rounded'>
        <HStack {...args} gap={4} flexShrink={false}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
          <Box>D</Box>
          <Box>E</Box>
        </HStack>
      </div>
    </Flex>
  </Flex>
);
