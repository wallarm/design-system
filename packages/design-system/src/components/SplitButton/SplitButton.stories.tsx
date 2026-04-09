import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChevronDown, CircleDashed } from '../../icons';
import { Button } from '../Button';
import { Heading } from '../Heading';
import { NumericBadge } from '../NumericBadge';
import { HStack, VStack } from '../Stack';
import { SplitButton } from './SplitButton';

const meta = {
  title: 'Actions/SplitButton',
  component: SplitButton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SplitButton>;

export default meta;

export const Default: StoryFn<typeof meta> = () => (
  <SplitButton data-testid='split-button'>
    <Button variant='primary' color='brand'>
      Button
    </Button>
    <Button variant='primary' color='brand'>
      <ChevronDown />
    </Button>
  </SplitButton>
);

export const Variants: StoryFn<typeof meta> = () => (
  <VStack>
    <Heading>Primary / Brand</Heading>
    <HStack>
      <SplitButton>
        <Button variant='primary' color='brand'>
          Button
        </Button>
        <Button variant='primary' color='brand'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <Heading>Outline / Neutral</Heading>
    <HStack>
      <SplitButton>
        <Button variant='outline' color='neutral'>
          Button
        </Button>
        <Button variant='outline' color='neutral'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <Heading>Secondary / Neutral</Heading>
    <HStack>
      <SplitButton>
        <Button variant='secondary' color='neutral'>
          Button
        </Button>
        <Button variant='secondary' color='neutral'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <Heading>Ghost / Neutral</Heading>
    <HStack>
      <SplitButton>
        <Button variant='ghost' color='neutral'>
          Button
        </Button>
        <Button variant='ghost' color='neutral'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <Heading>Secondary / Brand</Heading>
    <HStack>
      <SplitButton>
        <Button variant='secondary' color='brand'>
          Button
        </Button>
        <Button variant='secondary' color='brand'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <Heading>Ghost / Brand</Heading>
    <HStack>
      <SplitButton>
        <Button variant='ghost' color='brand'>
          Button
        </Button>
        <Button variant='ghost' color='brand'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>
  </VStack>
);

export const Sizes: StoryFn<typeof meta> = () => (
  <HStack align='end' justify='center'>
    <SplitButton>
      <Button variant='primary' color='brand' size='small'>
        Small
      </Button>
      <Button variant='primary' color='brand' size='small'>
        <ChevronDown />
      </Button>
    </SplitButton>
    <SplitButton>
      <Button variant='primary' color='brand' size='medium'>
        Medium
      </Button>
      <Button variant='primary' color='brand' size='medium'>
        <ChevronDown />
      </Button>
    </SplitButton>
    <SplitButton>
      <Button variant='primary' color='brand' size='large'>
        Large
      </Button>
      <Button variant='primary' color='brand' size='large'>
        <ChevronDown />
      </Button>
    </SplitButton>
  </HStack>
);

export const Content: StoryFn<typeof meta> = () => (
  <VStack>
    <Heading>Text only</Heading>
    <HStack align='end'>
      <SplitButton>
        <Button variant='primary' color='brand' size='large'>
          Large
        </Button>
        <Button variant='primary' color='brand' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='outline' color='neutral' size='large'>
          Large
        </Button>
        <Button variant='outline' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='secondary' color='neutral' size='large'>
          Large
        </Button>
        <Button variant='secondary' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <Heading>Icon + Text</Heading>
    <HStack align='end'>
      <SplitButton>
        <Button variant='primary' color='brand' size='large'>
          <CircleDashed />
          Large
        </Button>
        <Button variant='primary' color='brand' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='outline' color='neutral' size='large'>
          <CircleDashed />
          Large
        </Button>
        <Button variant='outline' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='secondary' color='neutral' size='large'>
          <CircleDashed />
          Large
        </Button>
        <Button variant='secondary' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <Heading>Icon + Text + Badge</Heading>
    <HStack align='end'>
      <SplitButton>
        <Button variant='primary' color='brand' size='large'>
          <CircleDashed />
          Large
          <NumericBadge type='primary'>1</NumericBadge>
        </Button>
        <Button variant='primary' color='brand' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='outline' color='neutral' size='large'>
          <CircleDashed />
          Large
          <NumericBadge type='outline'>1</NumericBadge>
        </Button>
        <Button variant='outline' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='secondary' color='neutral' size='large'>
          <CircleDashed />
          Large
          <NumericBadge type='outline'>1</NumericBadge>
        </Button>
        <Button variant='secondary' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <Heading>Icon only</Heading>
    <HStack align='end'>
      <SplitButton>
        <Button variant='primary' color='brand' size='large'>
          <CircleDashed />
        </Button>
        <Button variant='primary' color='brand' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='outline' color='neutral' size='large'>
          <CircleDashed />
        </Button>
        <Button variant='outline' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='secondary' color='neutral' size='large'>
          <CircleDashed />
        </Button>
        <Button variant='secondary' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>
  </VStack>
);
