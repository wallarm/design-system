import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChevronLeft, ChevronRight } from '../../icons';
import { Heading } from '../Heading';
import { HStack, VStack } from '../Stack';
import { ToggleButton } from './ToggleButton';

const meta = {
  title: 'Actions/ToggleButton',
  component: ToggleButton,
  parameters: {
    layout: 'centered',
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

export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <ToggleButton {...args}>Toggle Me</ToggleButton>
);

export const VariantsAndColors: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack>
    <Heading>Brand</Heading>
    <HStack>
      <ToggleButton {...args} variant='outline' color='brand'>
        Outline
      </ToggleButton>
      <ToggleButton {...args} variant='ghost' color='brand'>
        Ghost
      </ToggleButton>
    </HStack>

    <Heading>Neutral</Heading>
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

export const Controlled: StoryFn<typeof meta> = ({ ...args }) => {
  const [active, setActive] = useState<boolean>(false);

  return (
    <ToggleButton {...args} aria-label='Toggle option 1' active={active} onToggle={setActive}>
      Controlled
    </ToggleButton>
  );
};
