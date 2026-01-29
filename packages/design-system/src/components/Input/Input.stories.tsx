import { fn } from 'storybook/test';
import type { Meta, StoryObj } from 'storybook-react-rsbuild';

import { Input } from './Input';

const meta = {
  title: 'Inputs/Input',
  component: Input,
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
} satisfies Meta<typeof Input>;

export default meta;

export const Basic: StoryObj<typeof meta> = {};

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
