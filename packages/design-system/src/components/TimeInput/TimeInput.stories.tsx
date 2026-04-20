import { Time } from '@internationalized/date';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Clock } from '../../icons';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { TimeInput } from './TimeInput';

const meta: Meta<typeof TimeInput> = {
  title: 'Inputs Date/TimeInput',
  component: TimeInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Segmented time-only input with keyboard navigation. Supports hour and minute granularity, 12/24-hour cycle, and an optional time dropdown for quick selection.',
      },
    },
  },
  decorators: [
    Story => (
      <div style={{ minHeight: 360, paddingBottom: 280 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    granularity: {
      control: 'select',
      options: ['hour', 'minute', 'second'],
      description: 'Determines the smallest unit of time that can be edited.',
    },
    hourCycle: {
      control: 'select',
      options: [12, 24],
      description:
        'Force 12-hour (AM/PM) or 24-hour format. When not set, the hour cycle is determined by the browser locale (e.g. en-US → 12h, en-GB → 24h).',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input has an error state.',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when no value is selected.',
    },
    showTimeDropdown: {
      control: 'boolean',
      description: 'Show dropdown for time selection with arrow navigation.',
    },
    timeStep: {
      control: 'number',
      description: 'Time interval in minutes for dropdown options.',
    },
    size: {
      control: 'select',
      options: ['default', 'medium', 'small'],
      description: 'Visual size: default (36px), medium (32px), small (24px).',
    },
  },
  args: {
    granularity: 'minute',
    error: false,
    disabled: false,
    icon: Clock,
    showTimeDropdown: false,
    timeStep: undefined,
    size: 'default',
  },
};

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => {
  return <TimeInput {...args} />;
};

export const States: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Default
      </Text>
      <TimeInput />
      <TimeInput defaultValue={new Time(22, 0)} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Disabled
      </Text>
      <TimeInput disabled />
      <TimeInput disabled defaultValue={new Time(14, 30)} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Error
      </Text>
      <TimeInput error />
      <TimeInput error defaultValue={new Time(14, 30)} />
    </VStack>
  </HStack>
);

export const Sizes: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={16}>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Default (36px)
        </Text>
        <TimeInput size='default' />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Medium (32px)
        </Text>
        <TimeInput size='medium' />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Small (24px)
        </Text>
        <TimeInput size='small' />
      </VStack>
    </VStack>
    <VStack gap={16}>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Default filled
        </Text>
        <TimeInput size='default' defaultValue={new Time(22, 0)} />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Medium filled
        </Text>
        <TimeInput size='medium' defaultValue={new Time(22, 0)} />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Small filled
        </Text>
        <TimeInput size='small' defaultValue={new Time(22, 0)} />
      </VStack>
    </VStack>
  </HStack>
);

export const Filled: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack gap={4}>
      <Text size='sm' color='secondary'>
        24-hour
      </Text>
      <TimeInput hourCycle={24} defaultValue={new Time(22, 0)} />
    </VStack>
    <VStack gap={4}>
      <Text size='sm' color='secondary'>
        12-hour
      </Text>
      <TimeInput hourCycle={12} defaultValue={new Time(22, 0)} />
    </VStack>
  </VStack>
);

export const Granularity: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        12-hour format
      </Text>
      <TimeInput placeholder='hour' granularity='hour' hourCycle={12} />
      <TimeInput placeholder='hour:min' granularity='minute' hourCycle={12} />
      <TimeInput placeholder='hour:min:sec' granularity='second' hourCycle={12} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        24-hour format
      </Text>
      <TimeInput placeholder='hour' granularity='hour' hourCycle={24} />
      <TimeInput placeholder='hour:min' granularity='minute' hourCycle={24} />
      <TimeInput placeholder='hour:min:sec' granularity='second' hourCycle={24} />
    </VStack>
  </HStack>
);

export const TimeDropdownSteps: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        12-hour format
      </Text>
      <TimeInput placeholder='Every 15 min' showTimeDropdown timeStep={15} hourCycle={12} />
      <TimeInput placeholder='Every 30 min' showTimeDropdown timeStep={30} hourCycle={12} />
      <TimeInput placeholder='Every 60 min' showTimeDropdown timeStep={60} hourCycle={12} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        24-hour format
      </Text>
      <TimeInput placeholder='Every 15 min' showTimeDropdown timeStep={15} hourCycle={24} />
      <TimeInput placeholder='Every 30 min' showTimeDropdown timeStep={30} hourCycle={24} />
      <TimeInput placeholder='Every 60 min' showTimeDropdown timeStep={60} hourCycle={24} />
    </VStack>
  </HStack>
);
