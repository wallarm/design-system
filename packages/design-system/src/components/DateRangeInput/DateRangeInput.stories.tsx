import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Calendar } from '../../icons';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { DateRangeInput } from './DateRangeInput';
import type { DateRangeInputProps } from './types';

const meta: Meta<typeof DateRangeInput> = {
  title: 'Inputs Date/DateRangeInput',
  component: DateRangeInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Paired start/end date input for selecting date ranges. Supports date-only and date+time granularity, placeholder text, and an optional time dropdown. Can be used as a single compound component or composed from individual parts via `DateRangeProvider`.',
      },
    },
  },
  tags: ['alpha'],
  argTypes: {
    granularity: {
      control: 'select',
      options: ['day', 'hour', 'minute', 'second'],
      description:
        'Determines the smallest unit of time that can be edited. `day` shows date only, `hour`/`minute`/`second` add time segments to both start and end fields.',
    },
    hourCycle: {
      control: 'select',
      options: [12, 24],
      description:
        'Force 12-hour (AM/PM) or 24-hour format. When not set, the hour cycle is determined by the browser locale.',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input has an error state.',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled.',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only. Displays value but prevents editing.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown in both start and end fields when no value is selected.',
    },
    showTimeDropdown: {
      control: 'boolean',
      description:
        'Show dropdown for time selection with arrow navigation. Only effective when granularity includes time.',
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
    granularity: 'day',
    error: false,
    disabled: false,
    readOnly: false,
    icon: Calendar,
    placeholder: '',
    showTimeDropdown: false,
    timeStep: undefined,
    size: 'default',
  },
};

export default meta;

const defaultValue = {
  start: new CalendarDateTime(2024, 3, 15),
  end: new CalendarDateTime(2024, 3, 22),
};

const sampleRange = {
  start: new CalendarDate(2026, 1, 1),
  end: new CalendarDate(2026, 1, 16),
};

const sampleRangeDateTime = {
  start: new CalendarDateTime(2026, 1, 1, 22, 0),
  end: new CalendarDateTime(2026, 1, 16, 22, 0),
};

export const Basic: StoryFn<typeof meta> = args => {
  return <DateRangeInput {...(args as DateRangeInputProps)} />;
};

export const WithIcon: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Without icon
      </Text>
      <DateRangeInput defaultValue={defaultValue} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        With icon
      </Text>
      <DateRangeInput icon={Calendar} defaultValue={defaultValue} />
    </VStack>
  </HStack>
);

export const States: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Default
      </Text>
      <DateRangeInput icon={Calendar} />
      <DateRangeInput icon={Calendar} defaultValue={sampleRange} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Disabled
      </Text>
      <DateRangeInput icon={Calendar} disabled />
      <DateRangeInput icon={Calendar} disabled defaultValue={sampleRange} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Error
      </Text>
      <DateRangeInput icon={Calendar} error />
      <DateRangeInput icon={Calendar} error defaultValue={sampleRange} />
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
        <DateRangeInput icon={Calendar} size='default' />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Medium (32px)
        </Text>
        <DateRangeInput icon={Calendar} size='medium' />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Small (24px)
        </Text>
        <DateRangeInput icon={Calendar} size='small' />
      </VStack>
    </VStack>
    <VStack gap={16}>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Default filled
        </Text>
        <DateRangeInput icon={Calendar} size='default' defaultValue={sampleRange} />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Medium filled
        </Text>
        <DateRangeInput icon={Calendar} size='medium' defaultValue={sampleRange} />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Small filled
        </Text>
        <DateRangeInput icon={Calendar} size='small' defaultValue={sampleRange} />
      </VStack>
    </VStack>
  </HStack>
);

export const Filled: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack gap={4}>
      <Text size='sm' color='secondary'>
        Date range
      </Text>
      <DateRangeInput icon={Calendar} defaultValue={sampleRange} />
    </VStack>
    <VStack gap={4}>
      <Text size='sm' color='secondary'>
        Date + time range (24h)
      </Text>
      <DateRangeInput
        icon={Calendar}
        granularity='minute'
        hourCycle={24}
        defaultValue={sampleRangeDateTime}
      />
    </VStack>
    <VStack gap={4}>
      <Text size='sm' color='secondary'>
        Without icon
      </Text>
      <DateRangeInput defaultValue={sampleRange} />
    </VStack>
  </VStack>
);

export const Granularity: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        12-hour format
      </Text>
      <DateRangeInput icon={Calendar} placeholder='day' granularity='day' hourCycle={12} />
      <DateRangeInput icon={Calendar} placeholder='hour' granularity='hour' hourCycle={12} />
      <DateRangeInput icon={Calendar} placeholder='minute' granularity='minute' hourCycle={12} />
      <DateRangeInput icon={Calendar} placeholder='second' granularity='second' hourCycle={12} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        24-hour format
      </Text>
      <DateRangeInput icon={Calendar} placeholder='day' granularity='day' hourCycle={24} />
      <DateRangeInput icon={Calendar} placeholder='hour' granularity='hour' hourCycle={24} />
      <DateRangeInput icon={Calendar} placeholder='minute' granularity='minute' hourCycle={24} />
      <DateRangeInput icon={Calendar} placeholder='second' granularity='second' hourCycle={24} />
    </VStack>
  </HStack>
);
