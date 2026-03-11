import { useState } from 'react';
import { getLocalTimeZone, now, today } from '@internationalized/date';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Calendar } from '../../icons';
import { Field } from '../Field/Field';
import { FieldAction } from '../Field/FieldAction';
import { FieldDescription } from '../Field/FieldDescription';
import { FieldError } from '../Field/FieldError';
import { FieldLabel } from '../Field/FieldLabel';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { DateInput } from './DateInput';

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
    showTimeDropdown: {
      control: 'boolean',
      description:
        'Show dropdown for time selection with arrow navigation. Only effective when granularity includes time.',
    },
    timeStep: {
      control: 'number',
      description: 'Time interval in minutes for dropdown options.',
    },
  },
  args: {
    granularity: 'day',
    error: false,
    disabled: false,
    icon: Calendar,
    placeholder: '',
    showTimeDropdown: false,
    timeStep: undefined,
  },
};

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => {
  return <DateInput {...args} />;
};

export const WithIcon: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Without icon
      </Text>
      <DateInput />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        With icon
      </Text>
      <DateInput icon={Calendar} />
    </VStack>
  </HStack>
);

export const States: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Default
      </Text>
      <DateInput icon={Calendar} placeholder='Select a date' />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Disabled
      </Text>
      <DateInput icon={Calendar} placeholder='Select a date' disabled />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        Error
      </Text>
      <DateInput icon={Calendar} placeholder='Select a date' error />
    </VStack>
  </HStack>
);

export const Granularity: StoryFn<typeof meta> = () => (
  <HStack gap={24}>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        12-hour format
      </Text>
      <DateInput icon={Calendar} placeholder='day' granularity='day' hourCycle={12} />
      <DateInput icon={Calendar} placeholder='hour' granularity='hour' hourCycle={12} />
      <DateInput icon={Calendar} placeholder='minute' granularity='minute' hourCycle={12} />
      <DateInput icon={Calendar} placeholder='second' granularity='second' hourCycle={12} />
    </VStack>
    <VStack gap={12}>
      <Text size='sm' color='secondary'>
        24-hour format
      </Text>
      <DateInput icon={Calendar} placeholder='day' granularity='day' hourCycle={24} />
      <DateInput icon={Calendar} placeholder='hour' granularity='hour' hourCycle={24} />
      <DateInput icon={Calendar} placeholder='minute' granularity='minute' hourCycle={24} />
      <DateInput icon={Calendar} placeholder='second' granularity='second' hourCycle={24} />
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
        <DateInput icon={Calendar} placeholder='Select a date' value={value} onChange={setValue} />
        <FieldDescription>This is an input description.</FieldDescription>
      </Field>

      <Field invalid>
        <FieldLabel>Label</FieldLabel>
        <DateInput icon={Calendar} error value={errorValue} onChange={setErrorValue} />
        <FieldError>An error message.</FieldError>
      </Field>
    </VStack>
  );
};
