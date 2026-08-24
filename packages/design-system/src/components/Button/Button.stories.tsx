import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChevronLeft, ChevronRight } from '../../icons';
import { Heading } from '../Heading';
import { NumericBadge } from '../NumericBadge';
import { HStack, VStack } from '../Stack';
import { Button } from './Button';

const DESCRIPTION = [
  'Triggers an action — reach for `Link` when the control navigates somewhere instead, `ToggleButton` when it stays switched on, and `SplitButton` or `DropdownMenu` when several related actions compete for one slot.',
  "Keep one `variant='primary'` per view, and reserve `color='destructive'` for actions that are hard to undo.",
].join(' ');

const meta = {
  title: 'Actions/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },

  args: { onClick: fn() },
  argTypes: {
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

/**
 * A button with nothing set: you get the brand primary at the large size. Label it with a
 * verb and its object — `Delete rule` rather than `Delete` — so the action still reads on its own.
 */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => {
  return (
    <Button {...args} data-testid='button'>
      Button
    </Button>
  );
};

/**
 * `variant` sets emphasis and `color` sets meaning, and only the pairings drawn here are
 * designed: `primary` exists for `brand` and `destructive` only, and the neutral colors start at
 * `outline`. `neutral-alt` is the same ladder for a dark or coloured surface.
 */
export const Variants: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack>
    <Heading>Brand</Heading>

    <HStack>
      <Button {...args} variant='primary' color='brand'>
        Primary
      </Button>

      <Button {...args} variant='ghost' color='brand'>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='brand'>
        Secondary
      </Button>
    </HStack>

    <Heading>Neutral</Heading>

    <HStack>
      <Button {...args} variant='outline' color='neutral'>
        Outline
      </Button>

      <Button {...args} variant='ghost' color='neutral'>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='neutral'>
        Secondary
      </Button>
    </HStack>

    <Heading>Neutral Alt</Heading>

    <HStack>
      <Button {...args} variant='outline' color='neutral-alt'>
        Outline
      </Button>

      <Button {...args} variant='ghost' color='neutral-alt'>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='neutral-alt'>
        Secondary
      </Button>
    </HStack>

    <Heading>Destructive</Heading>

    <HStack>
      <Button {...args} variant='primary' color='destructive'>
        Primary
      </Button>

      <Button {...args} variant='outline' color='destructive'>
        Outline
      </Button>

      <Button {...args} variant='ghost' color='destructive'>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='destructive'>
        Secondary
      </Button>
    </HStack>
  </VStack>
);

/**
 * Three heights at identical emphasis; `large` is the default, and the smaller two are for
 * dense contexts like table rows and toolbars where a full-height button would dominate.
 */
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack align='end' justify='center'>
    <Button {...args} size='small'>
      Small
    </Button>
    <Button {...args} size='medium'>
      Medium
    </Button>
    <Button {...args} size='large'>
      Large
    </Button>
  </HStack>
);

/**
 * Every sanctioned pairing with the action unavailable. `disabled` also takes the button out
 * of the tab order, so say somewhere on screen what would re-enable it rather than leaving the
 * reader to guess.
 */
export const Disabled: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack>
    <Heading>Brand</Heading>

    <HStack>
      <Button {...args} variant='primary' color='brand' disabled>
        Primary
      </Button>

      <Button {...args} variant='ghost' color='brand' disabled>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='brand' disabled>
        Secondary
      </Button>
    </HStack>

    <Heading>Neutral</Heading>

    <HStack>
      <Button {...args} variant='outline' color='neutral' disabled>
        Outline
      </Button>

      <Button {...args} variant='ghost' color='neutral' disabled>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='neutral' disabled>
        Secondary
      </Button>
    </HStack>

    <Heading>Neutral Alt</Heading>

    <HStack>
      <Button {...args} variant='outline' color='neutral-alt' disabled>
        Outline
      </Button>

      <Button {...args} variant='ghost' color='neutral-alt' disabled>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='neutral-alt' disabled>
        Secondary
      </Button>
    </HStack>

    <Heading>Destructive</Heading>

    <HStack>
      <Button {...args} variant='primary' color='destructive' disabled>
        Primary
      </Button>

      <Button {...args} variant='outline' color='destructive' disabled>
        Outline
      </Button>

      <Button {...args} variant='ghost' color='destructive' disabled>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='destructive' disabled>
        Secondary
      </Button>
    </HStack>
  </VStack>
);

/**
 * `loading` covers the content with a spinner but keeps the label's footprint, so the button
 * doesn't resize mid-request. It disables the button on its own — passing `disabled` as well is
 * redundant.
 */
export const Loading: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack>
    <Heading>Brand</Heading>

    <HStack>
      <Button {...args} variant='primary' color='brand' loading>
        Primary
      </Button>

      <Button {...args} variant='ghost' color='brand' loading>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='brand' loading>
        Secondary
      </Button>
    </HStack>

    <Heading>Neutral</Heading>

    <HStack>
      <Button {...args} variant='outline' color='neutral' loading>
        Outline
      </Button>

      <Button {...args} variant='ghost' color='neutral' loading>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='neutral' loading>
        Secondary
      </Button>
    </HStack>

    <Heading>Neutral Alt</Heading>

    <HStack>
      <Button {...args} variant='outline' color='neutral-alt' loading>
        Outline
      </Button>

      <Button {...args} variant='ghost' color='neutral-alt' loading>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='neutral-alt' loading>
        Secondary
      </Button>
    </HStack>

    <Heading>Destructive</Heading>

    <HStack>
      <Button {...args} variant='primary' color='destructive' loading>
        Primary
      </Button>

      <Button {...args} variant='outline' color='destructive' loading>
        Outline
      </Button>

      <Button {...args} variant='ghost' color='destructive' loading>
        Ghost
      </Button>

      <Button {...args} variant='secondary' color='destructive' loading>
        Secondary
      </Button>
    </HStack>
  </VStack>
);

/**
 * An icon before the label, after it, or both. The button sizes and spaces icons itself, so
 * pass the icon bare; and if one button in a row carries an icon, they all should.
 */
export const Icons: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack>
    <Button {...args}>
      <ChevronLeft />
      Left icon
    </Button>

    <Button {...args}>
      Right icon
      <ChevronRight />
    </Button>

    <Button {...args}>
      <ChevronLeft />2 icons
      <ChevronRight />
    </Button>
  </HStack>
);

/**
 * A `NumericBadge` after the label, for a count the action applies to. The button tightens
 * its right padding whenever the last child isn't text, so a trailing badge or icon doesn't sit
 * stranded.
 */
export const Badge: StoryFn<typeof meta> = ({ ...args }) => (
  <Button {...args}>
    With badge
    <NumericBadge type='outline'>1</NumericBadge>
  </Button>
);

/**
 * There is no `iconOnly` prop: a button whose only child is an icon squares itself off. Give
 * it an `aria-label` naming the action and a `Tooltip`, since nothing on screen says what it does.
 */
export const IconOnly: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack>
    <Button {...args}>
      <ChevronRight />
    </Button>

    <Button {...args} loading>
      <ChevronRight />
    </Button>

    <Button {...args} disabled>
      <ChevronRight />
    </Button>
  </HStack>
);

/**
 * `asChild` puts the button's styling on your own `<a>`, so the element stays a real link and
 * middle-click and “open in new tab” keep working. Use it only when a navigation has to carry a
 * button's weight; ordinary navigation is a `Link`.
 */
export const LinkAsButton: StoryFn<typeof meta> = ({ ...args }) => (
  <Button {...args} asChild>
    <a href='https://google.com' target='_blank' rel='noopener noreferrer'>
      Button as link
    </a>
  </Button>
);

/**
 * `fullWidth` fills the container, for narrow surfaces like a `Drawer` or a dialog footer
 * rather than a wide desktop form. Two full-width buttons side by side split the row evenly
 * instead of overflowing it.
 */
export const FullWidth: StoryFn<typeof meta> = ({ ...args }) => (
  <div className='w-400'>
    <Button {...args} fullWidth>
      Full width example
    </Button>
  </div>
);
