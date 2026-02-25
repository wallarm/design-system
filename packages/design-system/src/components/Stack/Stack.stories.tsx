import type { ReactNode } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Flex } from '../Flex';
import { Heading } from '../Heading';
import { HStack } from './HStack';
import { Stack } from './Stack';
import { VStack } from './VStack';

const Box = ({ children }: { children: ReactNode }) => (
  <div className='flex h-24 w-24 items-center justify-center bg-blue-500 text-white rounded text-sm'>
    {children}
  </div>
);

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'padded',
  },
  args: {},
} satisfies Meta<typeof Stack>;

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Stack {...args} gap={4}>
    <Box>A</Box>
    <Box>B</Box>
    <Box>C</Box>
  </Stack>
);

export const Direction: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <Flex direction='column'>
      <Heading>VStack (Vertical)</Heading>
      <VStack {...args} gap={4}>
        <Box>1</Box>
        <Box>2</Box>
        <Box>3</Box>
      </VStack>
    </Flex>

    <Flex direction='column'>
      <Heading>HStack (Horizontal)</Heading>
      <HStack {...args} gap={4}>
        <Box>1</Box>
        <Box>2</Box>
        <Box>3</Box>
      </HStack>
    </Flex>
  </Flex>
);

export const Alignment: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <Flex direction='column'>
      <Heading>Align Start</Heading>
      <VStack {...args} align='start'>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>

    <Flex direction='column'>
      <Heading>Align Center</Heading>
      <VStack {...args} align='center'>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>

    <Flex direction='column'>
      <Heading>Align End</Heading>
      <VStack {...args} align='end'>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>
  </Flex>
);

export const Spacing: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <Flex direction='column'>
      <Heading>Spacing 2</Heading>
      <VStack {...args} gap={2}>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>

    <Flex direction='column'>
      <Heading>Spacing 4</Heading>
      <VStack {...args} gap={4}>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>

    <Flex direction='column'>
      <Heading>Spacing 8</Heading>
      <VStack {...args} gap={8}>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </VStack>
    </Flex>
  </Flex>
);

export const Wrap: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column'>
    <Heading>Wrap enabled (width: 12rem)</Heading>
    <HStack {...args} gap={2} wrap='wrap'>
      {new Array(40).fill(null).map((_, index) => {
        const key = `${index + 1}`;

        return <Box key={key}>{key}</Box>;
      })}
    </HStack>
  </Flex>
);

export const FlexBehavior: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction='column' gap={8}>
    <Flex direction='column'>
      <Heading>Default (no grow, no full width)</Heading>
      <HStack {...args} gap={4}>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </HStack>
    </Flex>

    <Flex direction='column'>
      <Heading>fullWidth</Heading>
      <HStack {...args} gap={4} fullWidth>
        <Box>A</Box>
        <Box>B</Box>
        <Box>C</Box>
      </HStack>
    </Flex>

    <Flex direction='column'>
      <Heading>flexGrow</Heading>
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
      <Heading>flexShrink=false (no shrink)</Heading>
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
