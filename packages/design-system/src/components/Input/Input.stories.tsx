import { fn } from 'storybook/test';
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild';
import { HStack } from '../Stack';
import { Input } from './Input';

const DESCRIPTION = [
  'Short, single-line free text — reach for `Textarea` when the answer runs to sentences, and `Select` when it comes from a known set.',
  'Wrap it in `Field` for the label and description; a placeholder is an example of the answer, never a substitute for the label and never where required information lives.',
].join(' ');

const meta = {
  title: 'Inputs/Input',
  component: Input,
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

/**
 * The bare control. Dropped inside a `Field` it reads that context and wires up its own
 * label, description and error state — you don't pass them.
 */
export const Basic: StoryObj<typeof meta> = {
  args: {
    'data-testid': 'input',
  },
};

/**
 * A 36 / 32 / 24px scale shared with `Textarea`, `InputGroup` and the date inputs, so a row
 * of mixed fields lines up. Reach below `default` only in dense places like a table filter.
 */
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={16} align='start'>
    <Input {...args} size='default' />
    <Input {...args} size='medium' />
    <Input {...args} size='small' />
  </HStack>
);

/**
 * Focus is a ring outside the border rather than a border change, so nothing reflows by a
 * pixel when the reader tabs through a form.
 */
export const Focused: StoryObj<typeof meta> = {
  parameters: { pseudo: { focusVisible: true } },
};

/**
 * Dimmed and not focusable. Say elsewhere what would enable it — a disabled field with no
 * explanation reads as broken.
 */
export const Disabled: StoryObj<typeof meta> = {
  args: {
    disabled: true,
  },
};

/**
 * A filled field. Placeholder text is deliberately set at the same size as real input so the
 * text doesn't jump when typing starts; only its colour is lighter.
 */
export const WithValue: StoryObj<typeof meta> = {
  args: {
    value: 'Some value...',
  },
};

/**
 * `error` reddens the border and sets `aria-invalid`. It shows that something is wrong but
 * not what — the message is `FieldError`'s job.
 */
export const WithError: StoryObj<typeof meta> = {
  args: {
    error: true,
  },
};
