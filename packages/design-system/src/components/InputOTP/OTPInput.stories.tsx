import { fn } from 'storybook/test';
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild';
import { Field } from '../Field';
import { FieldLabel } from '../Field/FieldLabel';
import { OTPInput } from './OTPInput';

const DESCRIPTION = [
  'A short code split into one cell per character, for codes that arrive by mail or from an authenticator — reach for `Input` for anything the reader knows by heart.',
  'Six cells by default, and `groupSize` inserts separators so the reader can check what they typed against what they were sent.',
].join(' ');

const meta = {
  title: 'Inputs/OTPInput',
  component: OTPInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
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

/**
 * Six cells, with focus advancing as the reader types and a paste filling the whole code at
 * once — pasting is how most codes actually arrive.
 */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => <OTPInput {...args} />;

/**
 * All cells out together. The code is a single value, so cells are never disabled
 * individually.
 */
export const Disabled: StoryObj<typeof meta> = {
  args: {
    disabled: true,
  },
};

/**
 * The invalid state across every cell, since a wrong code is wrong as a whole rather than in
 * one position.
 */
export const WithError: StoryObj<typeof meta> = {
  args: {
    error: true,
  },
};

/**
 * Numeric entry brings up the number keypad, and the `otp` flag lets a password manager or
 * the OS offer the code it has just received.
 */
export const Numeric: StoryObj<typeof meta> = {
  args: {
    type: 'numeric',
    otp: true,
  },
};

/**
 * `mask` hides the characters as they are entered. Reserve it for codes worth hiding —
 * masking a six-digit code the reader is copying off a screen only makes it harder.
 */
export const Masked: StoryObj<typeof meta> = {
  args: {
    mask: true,
    defaultValue: ['1', '2', '3', '4', '5', '6'],
    type: 'numeric',
  },
};

/**
 * Inside `Field`, so the instruction above the cells comes from `FieldLabel` and
 * `FieldDescription` — which is where to say where the code came from.
 */
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
