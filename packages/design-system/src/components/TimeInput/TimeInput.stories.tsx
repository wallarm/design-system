import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Clock } from '../../icons';
import { VStack } from '../Stack';
import { TimeInput } from './TimeInput';

const meta: Meta<typeof TimeInput> = {
  title: 'Inputs Date/TimeInput',
  component: TimeInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['alpha'],
};

export default meta;

export const Default: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <TimeInput />

      <TimeInput disabled />

      <TimeInput error />
    </VStack>
  );
};

export const WithIcon: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <TimeInput icon={Clock} />

      <TimeInput icon={Clock} disabled />

      <TimeInput icon={Clock} error />
    </VStack>
  );
};

export const WithPlaceholder: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <TimeInput icon={Clock} placeholder='Select time' granularity='minute' />

      <TimeInput icon={Clock} placeholder='Select time' granularity='minute' disabled />

      <TimeInput icon={Clock} placeholder='Select time' granularity='minute' error />
    </VStack>
  );
};

export const WithTimeDropdown: StoryFn = () => {
  return (
    <VStack spacing={12}>
      <TimeInput
        icon={Clock}
        placeholder='Select time'
        granularity='minute'
        showTimeDropdown
        timeStep={30}
      />

      <TimeInput
        icon={Clock}
        placeholder='Select time'
        granularity='minute'
        showTimeDropdown
        timeStep={15}
      />

      <TimeInput
        icon={Clock}
        placeholder='Select time'
        granularity='minute'
        showTimeDropdown
        timeStep={60}
      />
    </VStack>
  );
};
