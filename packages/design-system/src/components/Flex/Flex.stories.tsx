import type { FC, PropsWithChildren } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { cn } from '../../utils/cn';
import { Heading } from '../Heading';
import { VStack } from '../Stack';

import { Flex } from './Flex';

const Box: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      'flex h-40 py-4 px-8 items-center justify-center bg-blue-500 text-white rounded',
      className,
    )}
  >
    {children}
  </div>
);

const meta = {
  title: 'Layout/Flex',
  component: Flex,
  args: {},
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Flex>;

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex {...args} gap={4}>
    <Box>A</Box>
    <Box>B</Box>
    <Box>C</Box>
  </Flex>
);

export const Direction: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction="column" gap={8}>
    <VStack>
      <Heading>Row (default)</Heading>
      <Flex {...args} direction="row" gap={2}>
        <Box className="h-32 py-2 px-4 text-sm">1</Box>
        <Box className="h-32 py-2 px-4 text-sm">2</Box>
        <Box className="h-32 py-2 px-4 text-sm">3</Box>
      </Flex>
    </VStack>

    <VStack>
      <Heading>Column</Heading>
      <Flex {...args} direction="column" gap={2}>
        <Box className="h-32 py-2 px-4 text-sm">1</Box>
        <Box className="h-32 py-2 px-4 text-sm">2</Box>
        <Box className="h-32 py-2 px-4 text-sm">3</Box>
      </Flex>
    </VStack>

    <VStack>
      <Heading>Row Reverse</Heading>
      <Flex {...args} direction="row-reverse" gap={2}>
        <Box className="h-32 py-2 px-4 text-sm">1</Box>
        <Box className="h-32 py-2 px-4 text-sm">2</Box>
        <Box className="h-32 py-2 px-4 text-sm">3</Box>
      </Flex>
    </VStack>
  </Flex>
);

export const Alignment: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction="column" gap={8}>
    <VStack>
      <Heading>Justify Start (default)</Heading>
      <Flex {...args} justify="start" fullWidth>
        <Box className="h-16 w-16 text-xs">A</Box>
        <Box className="h-16 w-16 text-xs">B</Box>
      </Flex>
    </VStack>

    <VStack>
      <Heading>Justify Center</Heading>
      <Flex {...args} justify="center" fullWidth>
        <Box className="h-16 w-16 text-xs">A</Box>
        <Box className="h-16 w-16 text-xs">B</Box>
      </Flex>
    </VStack>

    <VStack>
      <Heading>Justify Between</Heading>
      <Flex {...args} justify="between" fullWidth>
        <Box className="h-16 w-16 text-xs">A</Box>
        <Box className="h-16 w-16 text-xs">B</Box>
      </Flex>
    </VStack>
  </Flex>
);

export const Wrap: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack>
    <Heading>Wrap enabled (container: 24rem)</Heading>
    <Flex {...args} wrap="wrap" gap={2} fullWidth>
      {new Array(40).fill(null).map((_, index) => {
        const key = `${index + 1}`;

        return (
          <Box className="h-20 w-20 text-xs" key={key}>
            {key}
          </Box>
        );
      })}
    </Flex>
  </VStack>
);

export const GrowShrink: StoryFn<typeof meta> = ({ ...args }) => (
  <Flex direction="column" gap={8}>
    <VStack>
      <Heading>Grow: items expand to fill space</Heading>
      <Flex {...args} fullWidth>
        <Box className="h-16 flex-1 text-xs">Flex-1</Box>
        <Box className="h-16 flex-1 text-xs">Flex-1</Box>
        <Box className="h-16 text-xs">Fixed</Box>
      </Flex>
    </VStack>

    <VStack>
      <Heading>Shrink: items shrink when needed</Heading>
      <Flex {...args} fullWidth>
        <Box className="h-16 flex-shrink text-xs">Shrinkable long content</Box>
        <Box className="h-16 flex-shrink-0 text-xs">No shrink</Box>
      </Flex>
    </VStack>
  </Flex>
);
