import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { ProgressColorEnum } from './constants';
import type { ProgressProps } from './Progress';
import { Progress } from './Progress';

const meta = {
  title: 'Loading/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: { type: 'number', min: 1 },
    },
    min: {
      control: { type: 'number' },
    },
    max: {
      control: { type: 'number', min: 1 },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    color: {
      control: 'select',
      options: Object.values(ProgressColorEnum),
    },
    showLabel: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;

export const Basic: StoryFn<ProgressProps> = args => (
  <div className='w-280'>
    <Progress {...args} />
  </div>
);

Basic.args = {
  value: 70,
  min: 0,
  max: 100,
  size: 'md',
  color: 'w-orange',
  showLabel: false,
};

export const Sizes: StoryFn<typeof meta> = () => (
  <div className='w-300'>
    <HStack gap={12}>
      <VStack align='end'>
        <Text truncate>Small</Text>
        <Text truncate>Medium (default)</Text>
        <Text truncate>Large</Text>
      </VStack>

      <VStack fullWidth justify='between' style={{ height: 'stretch' }}>
        <Progress value={20} size='sm' />
        <Progress value={40} size='md' />
        <Progress value={60} size='lg' />
      </VStack>
    </HStack>
  </div>
);

export const Colors: StoryFn<typeof meta> = () => (
  <div className='w-300'>
    <HStack gap={12}>
      <VStack align='end'>
        {Object.entries(ProgressColorEnum).map(([key]) => (
          <Text key={key}>{key}</Text>
        ))}
      </VStack>

      <VStack fullWidth justify='between' style={{ height: 'stretch' }}>
        {Object.entries(ProgressColorEnum).map(([_, color], index) => (
          <Progress
            key={color}
            value={index + 1}
            max={Object.entries(ProgressColorEnum).length}
            color={color}
            className='flex-1'
          />
        ))}
      </VStack>
    </HStack>
  </div>
);

export const WithLabel: StoryFn<typeof meta> = () => (
  <div className='w-280'>
    <VStack>
      <Progress value={25} size='sm' showLabel />
      <Progress value={50} showLabel color='green' />
      <Progress value={75} showLabel color='pink' size='lg' />
    </VStack>
  </div>
);

export const Indeterminate: StoryFn<typeof meta> = () => (
  <div className='w-280'>
    <Progress value={null} />
  </div>
);
