import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChevronLeft, ChevronRight } from '../../icons';
import { HStack, VStack } from '../Stack';
import { ToggleButton } from './ToggleButton';

const DESCRIPTION = [
  'A button that stays pressed — for something the reader flips in place and can see the result of, like pinning a panel or holding a filter on.',
  'Reach for `Switch` when it belongs in a settings form, and `SegmentedControl` when one of several options has to win.',
].join(' ');

const meta = {
  title: 'Actions/ToggleButton',
  component: ToggleButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },

  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'ghost'],
    },
    color: {
      control: 'select',
      options: ['brand', 'neutral'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    active: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;

/**
 * Uncontrolled: the button tracks its own pressed state from `defaultValue`, and `onToggle`
 * hands you the next value.
 */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <ToggleButton {...args} data-testid='toggle-button'>
    Toggle Me
  </ToggleButton>
);

/**
 * `outline` reads as a control that is always there; `ghost` disappears until needed, for
 * toolbars. `brand` tints the pressed state, `neutral` keeps it grey for when several toggles sit
 * together and colour would shout.
 */
export const VariantsAndColors: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack>
    <span className='sb-annotation'>Brand</span>
    <HStack>
      <ToggleButton {...args} variant='outline' color='brand'>
        Outline
      </ToggleButton>
      <ToggleButton {...args} variant='ghost' color='brand'>
        Ghost
      </ToggleButton>
    </HStack>

    <span className='sb-annotation'>Neutral</span>
    <HStack>
      <ToggleButton variant='outline' color='neutral'>
        Outline
      </ToggleButton>
      <ToggleButton variant='ghost' color='neutral'>
        Ghost
      </ToggleButton>
    </HStack>
  </VStack>
);

/**
 * Three heights matching `Button`, so a toggle can sit in a row of them without breaking
 * the line.
 */
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack align='center'>
    <ToggleButton {...args} size='small'>
      Small
    </ToggleButton>
    <ToggleButton {...args} size='medium'>
      Medium
    </ToggleButton>
    <ToggleButton {...args} size='large'>
      Large
    </ToggleButton>
  </HStack>
);

/**
 * Both states while disabled. A disabled toggle still shows whether it is on, which is the
 * point — say elsewhere why it cannot be changed.
 */
export const Disabled: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack>
    <ToggleButton {...args} disabled>
      Disabled
    </ToggleButton>
    <ToggleButton {...args} disabled active>
      Disabled Active
    </ToggleButton>
    <ToggleButton {...args} disabled variant='ghost'>
      Ghost Disabled
    </ToggleButton>
  </HStack>
);

/**
 * For a toggle whose effect is a request. It keeps the label's footprint and disables itself,
 * so the pressed state does not flicker while the answer is in flight.
 */
export const Loading: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack>
    <ToggleButton {...args} loading>
      Loading
    </ToggleButton>
    <ToggleButton {...args} loading active>
      Loading Active
    </ToggleButton>
    <ToggleButton {...args} loading variant='ghost'>
      Ghost Loading
    </ToggleButton>
  </HStack>
);

/**
 * An icon before or after the label. Pressed state is carried by the whole button, not the
 * icon, so don't swap the icon to signal it.
 */
export const Icons: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack>
    <ToggleButton {...args}>
      <ChevronLeft />
      Left icon
    </ToggleButton>
    <ToggleButton {...args}>
      Right icon
      <ChevronRight />
    </ToggleButton>
    <ToggleButton {...args}>
      <ChevronLeft />
      Both icons
      <ChevronRight />
    </ToggleButton>
  </HStack>
);

/**
 * The toolbar case: an icon alone squares the button off. `aria-label` is doing all the
 * naming here, so it is not optional.
 */
export const IconOnly: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack>
    <ToggleButton {...args} aria-label='Toggle option 1'>
      <ChevronRight />
    </ToggleButton>
    <ToggleButton {...args} loading aria-label='Toggle option 2'>
      <ChevronRight />
    </ToggleButton>
    <ToggleButton {...args} disabled aria-label='Toggle option 3'>
      <ChevronRight />
    </ToggleButton>
  </HStack>
);

/**
 * Pass `active` and own the state when something else has to move with it — a panel opening,
 * a filter applying. Once `active` is set the button stops tracking itself.
 */
export const Controlled: StoryFn<typeof meta> = ({ ...args }) => {
  const [active, setActive] = useState<boolean>(false);

  return (
    <ToggleButton {...args} aria-label='Toggle option 1' active={active} onToggle={setActive}>
      Controlled
    </ToggleButton>
  );
};
