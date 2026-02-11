import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChevronLeft, ChevronRight } from '../../icons';
import { Heading } from '../Heading';
import { NumericBadge } from '../NumericBadge';
import { HStack, VStack } from '../Stack';
import { Button } from './Button';

const meta = {
  title: 'Actions/Button',
  component: Button,
  parameters: {
    layout: 'centered',
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

export const Basic: StoryFn<typeof meta> = ({ ...args }) => {
  return <Button {...args}>Button</Button>;
};

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

export const Badge: StoryFn<typeof meta> = ({ ...args }) => (
  <Button {...args}>
    With badge
    <NumericBadge type='outline'>1</NumericBadge>
  </Button>
);

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

export const LinkAsButton: StoryFn<typeof meta> = ({ ...args }) => (
  <Button {...args} asChild>
    <a href='https://google.com' target='_blank' rel='noopener noreferrer'>
      Button as link
    </a>
  </Button>
);

export const FullWidth: StoryFn<typeof meta> = ({ ...args }) => (
  <div className='w-400'>
    <Button {...args} fullWidth>
      Full width example
    </Button>
  </div>
);
