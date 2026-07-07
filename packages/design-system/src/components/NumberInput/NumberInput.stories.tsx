import { fn } from 'storybook/test';
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild';
import { HStack } from '../Stack';
import { NumberInput } from './NumberInput';

const meta = {
  title: 'Inputs/NumberInput',
  component: NumberInput,
  parameters: {
    layout: 'centered',
  },
  args: {
    onChange: fn(),
  },
  argTypes: {
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;

export const Basic: StoryObj<typeof meta> = {
  args: {
    'data-testid': 'number-input',
  },
};

export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={16} align='start'>
    <NumberInput {...args} size='default' />
    <NumberInput {...args} size='medium' />
    <NumberInput {...args} size='small' />
  </HStack>
);

export const Disabled: StoryObj<typeof meta> = {
  args: {
    disabled: true,
  },
};

export const WithValue: StoryObj<typeof meta> = {
  args: {
    value: '999',
  },
};

export const WithError: StoryObj<typeof meta> = {
  args: {
    error: true,
  },
};
