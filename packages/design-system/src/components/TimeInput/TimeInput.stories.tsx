import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Time } from '../../index';
import { DateFormatProvider } from '../DateFormatProvider';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { TimeInput } from './TimeInput';

const meta: Meta<typeof TimeInput> = {
  title: 'Inputs Date/TimeInput',
  component: TimeInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Segmented time-only input with keyboard navigation. Supports hour and minute granularity, 12/24-hour cycle, and an optional time dropdown for quick selection.',
      },
    },
  },
  argTypes: {
    granularity: {
      control: 'select',
      options: ['hour', 'minute', 'second'],
      description: 'Determines the smallest unit of time that can be edited.',
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
      description: 'Placeholder text shown when no value is selected.',
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the leading clock icon. Default: true.',
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
    readOnly: false,
    showIcon: true,
    size: 'default',
  },
};

export default meta;

const dropdownRoom: StoryFn<typeof meta>['decorators'] = [
  Story => (
    <div style={{ minHeight: 360, paddingBottom: 280 }}>
      <Story />
    </div>
  ),
];

export const Basic: StoryFn<typeof meta> = ({ ...args }) => {
  return <TimeInput {...args} />;
};
Basic.decorators = dropdownRoom;
Basic.parameters = { layout: 'padded' };

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

/**
 * `showIcon` toggles the leading clock icon. It defaults to `true`; pass
 * `showIcon={false}` for a bare segmented field (e.g. dense tables or when a
 * label already conveys the field's meaning).
 */
export const Icon: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        With icon
      </Text>
      <TimeInput showIcon />
      <TimeInput showIcon defaultValue={new Time(22, 0)} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Without icon
      </Text>
      <TimeInput showIcon={false} />
      <TimeInput showIcon={false} defaultValue={new Time(22, 0)} />
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
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          24-hour
        </Text>
        <TimeInput defaultValue={new Time(22, 0)} />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='day-first' hourCycle={12}>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          12-hour
        </Text>
        <TimeInput defaultValue={new Time(22, 0)} />
      </VStack>
    </DateFormatProvider>
  </VStack>
);

export const Granularity: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <DateFormatProvider order='day-first' hourCycle={12}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          12-hour format
        </Text>
        <TimeInput placeholder='hour' granularity='hour' />
        <TimeInput placeholder='hour:min' granularity='minute' />
        <TimeInput placeholder='hour:min:sec' granularity='second' />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          24-hour format
        </Text>
        <TimeInput placeholder='hour' granularity='hour' />
        <TimeInput placeholder='hour:min' granularity='minute' />
        <TimeInput placeholder='hour:min:sec' granularity='second' />
      </VStack>
    </DateFormatProvider>
  </HStack>
);

export const TimeDropdownSteps: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <DateFormatProvider order='day-first' hourCycle={12}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          12-hour format
        </Text>
        <TimeInput placeholder='Every 15 min' showTimeDropdown timeStep={15} />
        <TimeInput placeholder='Every 30 min' showTimeDropdown timeStep={30} />
        <TimeInput placeholder='Every 60 min' showTimeDropdown timeStep={60} />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          24-hour format
        </Text>
        <TimeInput placeholder='Every 15 min' showTimeDropdown timeStep={15} />
        <TimeInput placeholder='Every 30 min' showTimeDropdown timeStep={30} />
        <TimeInput placeholder='Every 60 min' showTimeDropdown timeStep={60} />
      </VStack>
    </DateFormatProvider>
  </HStack>
);
TimeDropdownSteps.decorators = dropdownRoom;
TimeDropdownSteps.parameters = { layout: 'padded' };

/**
 * `readOnly` shows a value but removes every edit affordance — typing is
 * ignored (react-aria), and the clear "×" is not rendered at all.
 */
export const ReadOnly: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Locale
      </Text>
      <TimeInput readOnly defaultValue={new Time(22, 0)} />
    </VStack>
    <DateFormatProvider order='day-first' hourCycle={12}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          12-hour
        </Text>
        <TimeInput readOnly defaultValue={new Time(22, 0)} />
      </VStack>
    </DateFormatProvider>
    <DateFormatProvider order='day-first' hourCycle={24}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          24-hour
        </Text>
        <TimeInput readOnly defaultValue={new Time(22, 0)} />
      </VStack>
    </DateFormatProvider>
  </HStack>
);
ReadOnly.parameters = { layout: 'padded' };
