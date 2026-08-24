import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Text } from '../Text';
import { Code } from './Code';

const DESCRIPTION = [
  'Geist Mono for code, identifiers and machine-readable values — anything read as literal rather than as prose.',
  'This ramp is for inline fragments; multi-line blocks are `CodeSnippet`, drawn with looser leading so stacked lines breathe.',
].join(' ');

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

/**
 * An inline fragment in running text. It keeps the surrounding line height, so a paragraph
 * containing code does not open up.
 */
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

/**
 * The ramp. Never add letter-spacing to it — monospace depends on a fixed character cell, and
 * tracking breaks alignment in diffs, terminal output and anything measured in `ch`.
 */
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

/**
 * Weight for emphasis within code, which buys less here than elsewhere: in a monospace run,
 * bold is harder to spot than colour.
 */
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

/**
 * The same de-emphasis ladder as `Text`, for dimming part of an identifier rather than all of
 * it.
 */
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

/**
 * What happens when code wraps in this ramp — tight leading, because it is drawn for one line.
 * Past a couple of lines, reach for `CodeSnippet`.
 */
export const Multiline: StoryFn<typeof meta> = ({ ...args }) => (
  <Code {...args} size='m'>
    {`function example() {
  const message = 'Hello, World!';
  console.log(message);
  return message;
}`}
  </Code>
);

/**
 * `italic` is a modifier rather than a step, pairing with any size and weight. Conventionally
 * it marks a placeholder the reader is meant to replace.
 */
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

/**
 * `asChild` puts the monospace styling on your own element, for when the tag carries meaning
 * the styling should not override.
 */
export const AsChild: StoryFn<typeof meta> = ({ ...args }) => (
  <Code {...args} size='m' weight='medium' asChild>
    <code>{'<CustomCodeElement />'}</code>
  </Code>
);
