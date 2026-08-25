import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info } from '../../icons';
import { Button } from '../Button';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Kbd } from './Kbd';
import { KbdGroup } from './KbdGroup';

const DESCRIPTION = [
  'Shows a keyboard shortcut as a `<kbd>` cap. It is display-only — the DS binds nothing, so the `keydown` handler stays yours — and `Code` is the one to reach for when what you are showing is a value rather than a key.',
  'One cap holds one key and `KbdGroup` sets out a combination; render the modifier symbols (⌘, ⇧, ⌥, ↵) rather than the words, so the same shortcut reads the same everywhere.',
].join(' ');

const meta = {
  title: 'Primitives/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Kbd>;

export default meta;

/** A single cap at the default size. The look is fixed — `size` is the way in, `className` is not. */
export const Basic: StoryFn<typeof meta> = () => <Kbd>⌘</Kbd>;

/** `KbdGroup` lays a combination out one cap per key: modifiers on their own above, and a two-key chord below where the `+` is plain text between the caps. */
export const Group: StoryFn<typeof meta> = () => (
  <VStack>
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>⌥</Kbd>
      <Kbd>⌃</Kbd>
    </KbdGroup>

    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <Text>+</Text>
      <Kbd>B</Kbd>
    </KbdGroup>
  </VStack>
);

/** `small` beside `medium`. Match the cap to the density of the text around it rather than to what looks best on its own. */
export const Sizes: StoryFn<typeof meta> = () => (
  <HStack>
    <Kbd size='small'>⌘</Kbd>
    <Kbd size='medium'>⌘</Kbd>
  </HStack>
);

/** Inside a `Tooltip` the cap restyles itself for the inverted surface, so a shortcut hint needs nothing special from you. */
export const WithTooltip: StoryFn<typeof meta> = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant='outline' color='neutral'>
        <Info />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      Add instance <Kbd>⌘</Kbd>
    </TooltipContent>
  </Tooltip>
);
