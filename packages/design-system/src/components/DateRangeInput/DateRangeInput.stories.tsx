import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CalendarDate, CalendarDateTime } from '../../index';
import { DateFormatProvider } from '../DateFormatProvider';
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
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the leading calendar icon. Default: true.',
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
    showIcon: true,
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

const dropdownRoom: StoryFn<typeof meta>['decorators'] = [
  Story => (
    <div style={{ minHeight: 360, paddingBottom: 280 }}>
      <Story />
    </div>
  ),
];

export const Basic: StoryFn<typeof meta> = args => {
  return <DateRangeInput {...(args as DateRangeInputProps)} />;
};
Basic.decorators = dropdownRoom;
Basic.parameters = { layout: 'padded' };

export const WithIcon: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Without icon
      </Text>
      <DateRangeInput showIcon={false} defaultValue={defaultValue} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        With icon
      </Text>
      <DateRangeInput defaultValue={defaultValue} />
    </VStack>
  </HStack>
);

export const States: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Default
      </Text>
      <DateRangeInput />
      <DateRangeInput defaultValue={sampleRange} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Disabled
      </Text>
      <DateRangeInput disabled />
      <DateRangeInput disabled defaultValue={sampleRange} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Error
      </Text>
      <DateRangeInput error />
      <DateRangeInput error defaultValue={sampleRange} />
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
        <DateRangeInput size='default' />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Medium (32px)
        </Text>
        <DateRangeInput size='medium' />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Small (24px)
        </Text>
        <DateRangeInput size='small' />
      </VStack>
    </VStack>
    <VStack gap={16}>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Default filled
        </Text>
        <DateRangeInput size='default' defaultValue={sampleRange} />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Medium filled
        </Text>
        <DateRangeInput size='medium' defaultValue={sampleRange} />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Small filled
        </Text>
        <DateRangeInput size='small' defaultValue={sampleRange} />
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
      <DateRangeInput defaultValue={sampleRange} />
    </VStack>
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Date + time range (24h)
        </Text>
        <DateRangeInput granularity='minute' defaultValue={sampleRangeDateTime} />
      </VStack>
    </DateFormatProvider>
    <VStack gap={4}>
      <Text size='sm' color='secondary'>
        Without icon
      </Text>
      <DateRangeInput showIcon={false} defaultValue={sampleRange} />
    </VStack>
  </VStack>
);

export const Granularity: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <DateFormatProvider order='day-first' hourCycle={12}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          12-hour format
        </Text>
        <DateRangeInput placeholder='day' granularity='day' />
        <DateRangeInput placeholder='hour' granularity='hour' />
        <DateRangeInput placeholder='minute' granularity='minute' />
        <DateRangeInput placeholder='second' granularity='second' />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          24-hour format
        </Text>
        <DateRangeInput placeholder='day' granularity='day' />
        <DateRangeInput placeholder='hour' granularity='hour' />
        <DateRangeInput placeholder='minute' granularity='minute' />
        <DateRangeInput placeholder='second' granularity='second' />
      </VStack>
    </DateFormatProvider>
  </HStack>
);

/**
 * Demonstrates both segment orders side by side. Each column wraps its
 * DateRangeInputs in a scoped `DateFormatProvider` — in real apps the
 * provider is mounted once near the root and the whole tree picks up a
 * single order.
 */
export const DateOrderComparison: StoryFn<typeof meta> = () => (
  <HStack gap={32}>
    <DateFormatProvider order='day-first'>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          Day first — DD MMM YYYY
        </Text>
        <DateRangeInput />
        <DateRangeInput defaultValue={sampleRange} />
        <DateRangeInput granularity='minute' defaultValue={sampleRangeDateTime} />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='month-first'>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          Month first — MMM DD YYYY
        </Text>
        <DateRangeInput />
        <DateRangeInput defaultValue={sampleRange} />
        <DateRangeInput granularity='minute' defaultValue={sampleRangeDateTime} />
      </VStack>
    </DateFormatProvider>
  </HStack>
);
DateOrderComparison.parameters = { layout: 'padded' };

/**
 * Demonstrates `hourCycle` picked up from `DateFormatProvider`, not passed
 * per input. No `hourCycle` prop on the individual DateRangeInputs.
 */
export const HourCycleByContext: StoryFn<typeof meta> = () => (
  <HStack gap={32}>
    <DateFormatProvider order='day-first' hourCycle={12}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          12-hour (AM/PM)
        </Text>
        <DateRangeInput granularity='minute' defaultValue={sampleRangeDateTime} />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          24-hour
        </Text>
        <DateRangeInput granularity='minute' defaultValue={sampleRangeDateTime} />
      </VStack>
    </DateFormatProvider>
  </HStack>
);
HourCycleByContext.parameters = { layout: 'padded' };

/**
 * `readOnly` shows a value but removes every edit affordance — typing is
 * ignored (react-aria), and the trailing clear "×" is not rendered at all.
 */
export const ReadOnly: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Date range
      </Text>
      <DateRangeInput readOnly defaultValue={sampleRange} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Date + time range
      </Text>
      <DateRangeInput readOnly granularity='minute' defaultValue={sampleRangeDateTime} />
    </VStack>
  </HStack>
);
ReadOnly.parameters = { layout: 'padded' };
