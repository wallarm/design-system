import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Calendar } from '../../icons';
import { VStack } from '../Stack';
import { DateTimeInput } from './DateTimeInput';

const meta: Meta<typeof DateTimeInput> = {
  title: 'Inputs Date/DateTimeInput',
  component: DateTimeInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['alpha'],
};

export default meta;

export const Default: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <DateTimeInput />

      <DateTimeInput disabled />

      <DateTimeInput error />
    </VStack>
  );
};

export const HourCycle: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <DateTimeInput hourCycle={12} />

      <DateTimeInput hourCycle={12} disabled />

      <DateTimeInput hourCycle={12} error />
    </VStack>
  );
};

export const WithIcon: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <DateTimeInput icon={Calendar} />

      <DateTimeInput icon={Calendar} disabled />

      <DateTimeInput icon={Calendar} error />
    </VStack>
  );
};

export const WithPlaceholder: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <DateTimeInput icon={Calendar} placeholder='Select date and time' />

      <DateTimeInput icon={Calendar} placeholder='Select date and time' disabled />

      <DateTimeInput icon={Calendar} placeholder='Select date and time' error />
    </VStack>
  );
};

export const WithTimeDropdown: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <DateTimeInput
        icon={Calendar}
        placeholder='Select date and time'
        showTimeDropdown
        timeStep={30}
      />

      <DateTimeInput
        icon={Calendar}
        placeholder='Select date and time'
        showTimeDropdown
        timeStep={15}
      />

      <DateTimeInput
        icon={Calendar}
        placeholder='Select date and time'
        showTimeDropdown
        timeStep={60}
      />
    </VStack>
  );
};
