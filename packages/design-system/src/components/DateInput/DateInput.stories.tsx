import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CalendarDate, CalendarDateTime, getLocalTimeZone, today } from '../../index';
import { Field, FieldAction, FieldDescription, FieldError, FieldLabel } from '../Field';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { DateInput } from './DateInput';

const sampleDate = new CalendarDate(2026, 1, 1);
const sampleDateTime = new CalendarDateTime(2026, 1, 1, 22, 0);

const meta: Meta<typeof DateInput> = {
  title: 'Inputs Date/DateInput',
  component: DateInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Segmented date input with keyboard navigation and locale-aware formatting. Supports date-only and date+time granularity via the `granularity` prop. Built on top of React Aria `useDateField`.',
      },
    },
  },
  argTypes: {
    granularity: {
      control: 'select',
      options: ['day', 'hour', 'minute', 'second'],
      description:
        'Determines the smallest unit of time that can be edited. `day` shows date only, `hour`/`minute`/`second` add time segments.',
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
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when no value is selected.',
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
    showIcon: true,
    showTimeDropdown: false,
    timeStep: undefined,
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
  return <DateInput {...args} />;
};
Basic.decorators = dropdownRoom;
Basic.parameters = { layout: 'padded' };

export const WithIcon: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Without icon
      </Text>
      <DateInput showIcon={false} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        With icon
      </Text>
      <DateInput />
    </VStack>
  </HStack>
);

export const States: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Default
      </Text>
      <DateInput />
      <DateInput defaultValue={sampleDate} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Disabled
      </Text>
      <DateInput disabled />
      <DateInput disabled defaultValue={sampleDate} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Error
      </Text>
      <DateInput error />
      <DateInput error defaultValue={sampleDate} />
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
        <DateInput size='default' />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Medium (32px)
        </Text>
        <DateInput size='medium' />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Small (24px)
        </Text>
        <DateInput size='small' />
      </VStack>
    </VStack>
    <VStack gap={16}>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Default filled
        </Text>
        <DateInput size='default' defaultValue={sampleDate} />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Medium filled
        </Text>
        <DateInput size='medium' defaultValue={sampleDate} />
      </VStack>
      <VStack gap={4}>
        <Text size='sm' color='secondary'>
          Small filled
        </Text>
        <DateInput size='small' defaultValue={sampleDate} />
      </VStack>
    </VStack>
  </HStack>
);

export const Filled: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack gap={4}>
      <Text size='sm' color='secondary'>
        Date
      </Text>
      <DateInput defaultValue={sampleDate} />
    </VStack>
    <VStack gap={4}>
      <Text size='sm' color='secondary'>
        Date + time (24h)
      </Text>
      <DateInput granularity='minute' hourCycle={24} defaultValue={sampleDateTime} />
    </VStack>
    <VStack gap={4}>
      <Text size='sm' color='secondary'>
        Date + time (12h)
      </Text>
      <DateInput granularity='minute' hourCycle={12} defaultValue={sampleDateTime} />
    </VStack>
    <VStack gap={4}>
      <Text size='sm' color='secondary'>
        Without icon
      </Text>
      <DateInput showIcon={false} defaultValue={sampleDate} />
    </VStack>
  </VStack>
);

export const Granularity: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        12-hour format
      </Text>
      <DateInput placeholder='day' granularity='day' hourCycle={12} />
      <DateInput placeholder='hour' granularity='hour' hourCycle={12} />
      <DateInput placeholder='minute' granularity='minute' hourCycle={12} />
      <DateInput placeholder='second' granularity='second' hourCycle={12} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        24-hour format
      </Text>
      <DateInput placeholder='day' granularity='day' hourCycle={24} />
      <DateInput placeholder='hour' granularity='hour' hourCycle={24} />
      <DateInput placeholder='minute' granularity='minute' hourCycle={24} />
      <DateInput placeholder='second' granularity='second' hourCycle={24} />
    </VStack>
  </HStack>
);

export const WithFieldComponents: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState<any>(null);
  const [errorValue, setErrorValue] = useState<any>(today(getLocalTimeZone()));

  const handleSetNow = () => {
    setValue(today(getLocalTimeZone()));
  };

  return (
    <VStack gap={24}>
      <Field>
        <FieldLabel>
          Label
          <FieldAction onClick={handleSetNow}>Set now</FieldAction>
        </FieldLabel>
        <DateInput placeholder='Select a date' value={value} onChange={setValue} />
        <FieldDescription>This is an input description.</FieldDescription>
      </Field>

      <Field invalid>
        <FieldLabel>Label</FieldLabel>
        <DateInput error value={errorValue} onChange={setErrorValue} />
        <FieldError>An error message.</FieldError>
      </Field>
    </VStack>
  );
};
