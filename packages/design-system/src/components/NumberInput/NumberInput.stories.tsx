import { fn } from 'storybook/test';
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild';
import { HStack } from '../Stack';
import { NumberInput } from './NumberInput';

const DESCRIPTION = [
  'A number the reader nudges rather than types from scratch — reach for `Input` when the figure is just data like a port or an ID, and `Slider` when the position matters more than the exact value.',
  'It starts at zero rather than empty, so pass `defaultValue` wherever a pre-filled zero would be mistaken for an answer.',
].join(' ');

const meta = {
  title: 'Inputs/NumberInput',
  component: NumberInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
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

/**
 * The field with its steppers, which are always drawn — there is no version without them, so
 * this control always invites adjustment even when the reader would rather type.
 */
export const Basic: StoryObj<typeof meta> = {
  args: {
    'data-testid': 'number-input',
  },
};

/**
 * The same height scale as `Input`, with the steppers shrinking to match rather than being
 * dropped at the smaller sizes.
 */
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={16} align='start'>
    <NumberInput {...args} size='default' />
    <NumberInput {...args} size='medium' />
    <NumberInput {...args} size='small' />
  </HStack>
);

/**
 * Field and steppers both out. Worth checking here that the value still reads clearly, since
 * a number nobody can change is often the number that matters.
 */
export const Disabled: StoryObj<typeof meta> = {
  args: {
    disabled: true,
  },
};

/**
 * A set value. Typing is allowed as well as stepping, and the value is clamped against `min`
 * and `max` rather than refused as it is typed.
 */
export const WithValue: StoryObj<typeof meta> = {
  args: {
    value: '999',
  },
};

/**
 * `error` reddens the border and sets the invalid state; the reason belongs in `FieldError`
 * beneath it.
 */
export const WithError: StoryObj<typeof meta> = {
  args: {
    error: true,
  },
};
