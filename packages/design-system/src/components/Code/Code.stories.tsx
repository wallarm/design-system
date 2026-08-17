import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Text } from '../Text';
import { Code } from './Code';

const DESCRIPTION = [
  'Geist Mono for code, identifiers and machine-readable values — anything the user is meant to read as literal.',
  'Italic is a modifier rather than a step in the scale: the `italic` prop pairs with any size and any weight.',
  'Never add letter-spacing to this ramp. Monospace depends on a fixed character cell, so tracking breaks alignment in diffs, terminal output and anything measured in `ch`.',
  'Multi-line blocks are `CodeSnippet`, not `Code`. It runs 12px on 20px leading so stacked lines breathe, where `size="s"` here is 12 on 16.',
].join('\n\n');

const meta = {
  title: 'Typography/Code',
  component: Code,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },

  args: {},
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l'],
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'bold'],
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Code>;

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Code {...args}>const example = 'code'</Code>
);

/** Size / leading in px, measured from the rendered component. */
const SIZES = [
  { size: 'xs', metrics: '10 / 12' },
  { size: 's', metrics: '12 / 16' },
  { size: 'm', metrics: '14 / 20' },
  { size: 'l', metrics: '16 / 20' },
] as const;

export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack gap={24} align='start'>
    {SIZES.map(({ size, metrics }) => (
      <VStack key={size} gap={4} align='start'>
        <Text size='xs' color='secondary'>
          size=&apos;{size}&apos; · {metrics}
        </Text>
        <Code {...args} size={size}>
          console.log('hello world');
        </Code>
      </VStack>
    ))}
  </VStack>
);

export const Weights: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Code {...args} size='m' weight='light'>
      const light = 'Light weight code';
    </Code>
    <Code {...args} size='m' weight='regular'>
      const regular = 'Regular weight code';
    </Code>
    <Code {...args} size='m' weight='medium'>
      const medium = 'Medium weight code';
    </Code>
    <Code {...args} size='m' weight='bold'>
      const bold = 'Bold weight code';
    </Code>
  </VStack>
);

export const Colors: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Code {...args} color='primary'>
      const light = 'Primary color code';
    </Code>
    <Code {...args} color='secondary'>
      const regular = 'Secondary color code';
    </Code>
  </VStack>
);

export const Multiline: StoryFn<typeof meta> = ({ ...args }) => (
  <Code {...args} size='m'>
    {`function example() {
  const message = 'Hello, World!';
  console.log(message);
  return message;
}`}
  </Code>
);

export const Italic: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Code {...args} size='s' italic>
      {'// Italic small code comment'}
    </Code>
    <Code {...args} size='m' italic>
      {'// Italic medium code comment'}
    </Code>
    <Code {...args} size='l' italic>
      {'// Italic large code comment'}
    </Code>
    <Code {...args} size='s' weight='bold' italic>
      {'// Bold italic small'}
    </Code>
    <Code {...args} size='m' weight='bold' italic>
      {'// Bold italic medium'}
    </Code>
    <Code {...args} size='l' weight='bold' italic>
      {'// Bold italic large'}
    </Code>
  </VStack>
);

export const AsChild: StoryFn<typeof meta> = ({ ...args }) => (
  <Code {...args} size='m' weight='medium' asChild>
    <code>{'<CustomCodeElement />'}</code>
  </Code>
);
