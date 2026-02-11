import { fn } from 'storybook/test';
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild';
import { HStack } from '../Stack';
import { Textarea } from './Textarea';

const meta = {
  title: 'Inputs/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  args: {
    onChange: fn(),
    placeholder: 'Placeholder',
  },
  argTypes: {
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;

export const Basic: StoryObj<typeof meta> = {};

export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack spacing={16} align='start'>
    <Textarea {...args} size='default' />
    <Textarea {...args} size='medium' />
    <Textarea {...args} size='small' />
  </HStack>
);

export const Focused: StoryObj<typeof meta> = {
  parameters: { pseudo: { focusVisible: true } },
};

export const Disabled: StoryObj<typeof meta> = {
  args: {
    disabled: true,
  },
};

export const WithValue: StoryObj<typeof meta> = {
  args: {
    value: 'Some value...',
  },
};

export const WithError: StoryObj<typeof meta> = {
  args: {
    error: true,
  },
};
