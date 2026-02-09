import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info } from '../../icons';
import { Button } from '../Button';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Kbd } from './Kbd';
import { KbdGroup } from './KbdGroup';

const meta = {
  title: 'Primitives/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Kbd>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => <Kbd>⌘</Kbd>;

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

export const Sizes: StoryFn<typeof meta> = () => (
  <HStack>
    <Kbd size='small'>⌘</Kbd>
    <Kbd size='medium'>⌘</Kbd>
  </HStack>
);

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
