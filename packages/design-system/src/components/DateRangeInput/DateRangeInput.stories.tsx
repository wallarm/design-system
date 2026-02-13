import { CalendarDateTime } from '@internationalized/date';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Calendar } from '../../icons';
import { HStack, VStack } from '../Stack';
import { DateRangeProvider } from './DateRangeContext';
import { DateRangeEnd } from './DateRangeEnd';
import { DateRangeGroup } from './DateRangeGroup';
import { DateRangeInput } from './DateRangeInput';
import { DateRangeSeparator } from './DateRangeSeparator';
import { DateRangeStart } from './DateRangeStart';

const meta: Meta<typeof DateRangeInput> = {
  title: 'Inputs Date/DateRangeInput',
  component: DateRangeInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['alpha'],
};

export default meta;

const defaultValue = {
  start: new CalendarDateTime(2024, 3, 15),
  end: new CalendarDateTime(2024, 3, 22),
};

export const Default: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <DateRangeInput />

      <DateRangeInput disabled />

      <DateRangeInput error />
    </VStack>
  );
};

export const WithDefaultValue: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <DateRangeInput defaultValue={defaultValue} />

      <DateRangeInput defaultValue={defaultValue} disabled />

      <DateRangeInput defaultValue={defaultValue} error />
    </VStack>
  );
};

export const Granularity: StoryFn = () => {
  return (
    <HStack spacing={24}>
      <VStack spacing={12}>
        <DateRangeInput defaultValue={defaultValue} />

        <DateRangeInput defaultValue={defaultValue} disabled />

        <DateRangeInput defaultValue={defaultValue} error />
      </VStack>

      <VStack spacing={12}>
        <DateRangeInput defaultValue={defaultValue} granularity='hour' />

        <DateRangeInput defaultValue={defaultValue} granularity='hour' disabled />

        <DateRangeInput defaultValue={defaultValue} granularity='hour' error />
      </VStack>
    </HStack>
  );
};

export const WithPlaceholder: StoryFn = () => {
  return (
    <div className='min-w-480'>
      <VStack spacing={12}>
        <DateRangeInput icon={Calendar} placeholder='Select date' />

        <DateRangeInput icon={Calendar} placeholder='Select date' disabled />

        <DateRangeInput icon={Calendar} placeholder='Select date' error />
      </VStack>
    </div>
  );
};

export const WithTimeDropdown: StoryFn = () => {
  return (
    <div className='min-w-480'>
      <VStack spacing={12}>
        <DateRangeInput
          icon={Calendar}
          placeholder='Select date'
          granularity='minute'
          showTimeDropdown
          timeStep={30}
        />

        <DateRangeInput
          icon={Calendar}
          placeholder='Select date'
          granularity='minute'
          showTimeDropdown
          timeStep={15}
        />

        <DateRangeInput
          icon={Calendar}
          placeholder='Select date'
          granularity='minute'
          showTimeDropdown
          timeStep={60}
        />
      </VStack>
    </div>
  );
};

export const CompoundTwoInputs: StoryFn = () => {
  return (
    <VStack spacing={64}>
      <VStack spacing={12}>
        <DateRangeProvider defaultValue={defaultValue}>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>

        <DateRangeProvider defaultValue={defaultValue} disabled>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>

        <DateRangeProvider defaultValue={defaultValue} error>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>
      </VStack>

      <VStack spacing={12}>
        <DateRangeProvider defaultValue={defaultValue} granularity='minute'>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>

        <DateRangeProvider defaultValue={defaultValue} granularity='minute' disabled>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>

        <DateRangeProvider defaultValue={defaultValue} granularity='minute' error>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>
      </VStack>

      <VStack spacing={12}>
        <DateRangeProvider defaultValue={defaultValue} granularity='second'>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>

        <DateRangeProvider defaultValue={defaultValue} granularity='second' disabled>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>

        <DateRangeProvider defaultValue={defaultValue} granularity='second' error>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>
      </VStack>

      <VStack spacing={12}>
        <DateRangeProvider defaultValue={defaultValue} hourCycle={12} granularity='second'>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>

        <DateRangeProvider defaultValue={defaultValue} hourCycle={12} granularity='second' disabled>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>

        <DateRangeProvider defaultValue={defaultValue} hourCycle={12} granularity='second' error>
          <DateRangeGroup>
            <DateRangeStart />
            <DateRangeSeparator />
            <DateRangeEnd />
          </DateRangeGroup>
        </DateRangeProvider>
      </VStack>
    </VStack>
  );
};
