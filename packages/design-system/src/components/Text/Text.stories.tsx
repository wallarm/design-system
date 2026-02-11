import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Text } from './Text';

const meta = {
  title: 'Typography/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },

  args: {},
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'bold'],
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Text>;

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Text {...args}>Default body text</Text>
);

export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Text {...args} size='xs'>
      Extra Small Body Text
    </Text>
    <Text {...args} size='sm'>
      Small Body Text
    </Text>
    <Text {...args} size='md'>
      Medium Body Text
    </Text>
    <Text {...args} size='lg'>
      Large Body Text
    </Text>
    <Text {...args} size='xl'>
      Extra Large Body Text
    </Text>
  </VStack>
);

export const Weights: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Text {...args} size='lg' weight='light'>
      Light Weight Body Text
    </Text>
    <Text {...args} size='lg' weight='regular'>
      Regular Weight Body Text
    </Text>
    <Text {...args} size='lg' weight='medium'>
      Medium Weight Body Text
    </Text>
    <Text {...args} size='lg' weight='bold'>
      Bold Weight Body Text
    </Text>
  </VStack>
);

export const Colors: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Text {...args} color='primary'>
      Primary color text
    </Text>
    <Text {...args} color='primary-alt'>
      Primary alt color text
    </Text>
    <Text {...args} color='secondary'>
      Secondary color text
    </Text>
    <Text {...args} color='secondary-alt'>
      Secondary alt color text
    </Text>
  </VStack>
);

export const AsChild: StoryFn<typeof meta> = ({ ...args }) => (
  <Text {...args} size='lg' weight='medium' asChild>
    <span>Custom Span Element with AsChild</span>
  </Text>
);
