import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { Indicator } from './Indicator';

const colors = ['info', 'brand', 'danger', 'warning', 'success', 'ai'] as const;

const meta = {
  title: 'Status Indication/Indicator',
  component: Indicator,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    color: {
      control: 'select',
      options: colors,
    },
  },
} satisfies Meta<typeof Indicator>;

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => <Indicator {...args} />;

export const AllVariants: StoryFn<typeof meta> = () => (
  <VStack gap={12}>
    <HStack align='center' gap={8}>
      <Text size='sm'>sm</Text>
      <Text size='sm'>md</Text>
    </HStack>
    {colors.map(color => (
      <HStack key={color} align='center' gap={24}>
        <Indicator size='sm' color={color} />
        <Indicator size='md' color={color} />
        <Text size='sm'>{color}</Text>
      </HStack>
    ))}
  </VStack>
);
