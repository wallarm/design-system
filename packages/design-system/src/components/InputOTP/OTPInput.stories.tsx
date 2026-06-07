import { fn } from 'storybook/test';
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild';
import { Field } from '../Field';
import { FieldLabel } from '../Field/FieldLabel';
import { OTPInput } from './OTPInput';

const meta = {
  title: 'Inputs/OTPInput',
  component: OTPInput,
  parameters: {
    layout: 'centered',
  },
  args: {
    type: 'alphanumeric',
    count: 6,
    groupSize: 2,
    separator: '\u2014',
    placeholder: '',
    error: false,
    disabled: false,
    mask: false,
    otp: false,
    onValueChange: fn(),
    onValueComplete: fn(),
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['numeric', 'alphanumeric', 'alphabetic'],
    },
    count: {
      control: { type: 'number', min: 1, max: 12 },
    },
    groupSize: {
      control: { type: 'number', min: 0, max: 6 },
    },
    separator: {
      control: { type: 'text' },
    },
    placeholder: {
      control: { type: 'text' },
    },
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    mask: {
      control: 'boolean',
    },
    otp: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof OTPInput>;

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => <OTPInput {...args} />;

export const Disabled: StoryObj<typeof meta> = {
  args: {
    disabled: true,
  },
};

export const WithError: StoryObj<typeof meta> = {
  args: {
    error: true,
  },
};

export const Numeric: StoryObj<typeof meta> = {
  args: {
    type: 'numeric',
    otp: true,
  },
};

export const Masked: StoryObj<typeof meta> = {
  args: {
    mask: true,
    defaultValue: ['1', '2', '3', '4', '5', '6'],
    type: 'numeric',
  },
};

export const WithField: StoryObj<typeof meta> = {
  decorators: [
    Story => (
      <div className='w-320'>
        <Story />
      </div>
    ),
  ],
  render: args => (
    <Field required>
      <FieldLabel>Label</FieldLabel>
      <OTPInput {...args} />
    </Field>
  ),
};
