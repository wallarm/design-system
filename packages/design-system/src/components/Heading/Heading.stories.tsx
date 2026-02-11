import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Text } from '../Text';
import { Heading } from './Heading';

const meta = {
  title: 'Typography/Heading',
  component: Heading,
  parameters: {
    layout: 'centered',
  },

  args: {},
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'],
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'bold'],
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'],
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Heading {...args}>Default Heading</Heading>
);

export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Heading {...args} size='sm'>
      Small Heading
    </Heading>
    <Heading {...args} size='md'>
      Medium Heading
    </Heading>
    <Heading {...args} size='lg'>
      Large Heading
    </Heading>
    <Heading {...args} size='xl'>
      Extra Large Heading
    </Heading>
    <Heading {...args} size='2xl'>
      2XL Heading
    </Heading>
    <Heading {...args} size='3xl'>
      3XL Heading
    </Heading>
    <Heading {...args} size='4xl'>
      4XL Heading
    </Heading>
    <Heading {...args} size='5xl'>
      5XL Heading
    </Heading>
    <Heading {...args} size='6xl'>
      6XL Heading
    </Heading>
    <Heading {...args} size='7xl'>
      7XL Heading
    </Heading>
  </VStack>
);

export const Weights: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Heading {...args} size='3xl' weight='light'>
      Light Weight Heading
    </Heading>
    <Heading {...args} size='3xl' weight='regular'>
      Regular Weight Heading
    </Heading>
    <Heading {...args} size='3xl' weight='medium'>
      Medium Weight Heading
    </Heading>
    <Heading {...args} size='3xl' weight='bold'>
      Bold Weight Heading
    </Heading>
  </VStack>
);

export const AsChild: StoryFn<typeof meta> = ({ ...args }) => (
  <Heading {...args} size='4xl' weight='bold' asChild>
    <h2>Custom H2 Element with AsChild</h2>
  </Heading>
);

export const PolymorphicElements: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Heading {...args} as='h1' size='4xl'>
      H1 Heading
    </Heading>
    <Heading {...args} as='h2' size='3xl'>
      H2 Heading
    </Heading>
    <Heading {...args} as='h3' size='2xl'>
      H3 Heading
    </Heading>
    <Heading {...args} as='h4' size='xl'>
      H4 Heading
    </Heading>
    <Heading {...args} as='h5' size='lg'>
      H5 Heading
    </Heading>
    <Heading {...args} as='h6' size='md'>
      H6 Heading
    </Heading>
  </VStack>
);

export const AsSpan: StoryFn<typeof meta> = ({ ...args }) => (
  <Text>
    This is a paragraph with{' '}
    <Heading {...args} as='span' size='lg' weight='bold'>
      inline heading text
    </Heading>{' '}
    using span element.
  </Text>
);

export const AsDiv: StoryFn<typeof meta> = ({ ...args }) => (
  <Heading {...args} as='div' size='2xl' weight='medium'>
    This heading is rendered as a div element
  </Heading>
);
