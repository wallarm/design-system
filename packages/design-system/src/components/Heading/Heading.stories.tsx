import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Text } from '../Text';
import { Heading } from './Heading';

const DESCRIPTION = [
  'Geist for titles and section headings, where hierarchy comes from the size step — reach for `Text` when the words are copy rather than a title.',
  'Visual size and document level are independent: pick `size` for how it looks and `as` for the outline, so a visually small heading can still be the `h2` the structure needs.',
].join(' ');

const meta = {
  title: 'Typography/Heading',
  component: Heading,
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
      options: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'],
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'bold'],
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'],
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;

/**
 * The default step. A heading is a title first and a size second, which is why the two are
 * separate props.
 */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Heading {...args}>Default Heading</Heading>
);

/** Size / leading in px, measured from the rendered component. */
const SIZES = [
  { size: '7xl', metrics: '72 / 72' },
  { size: '6xl', metrics: '60 / 60' },
  { size: '5xl', metrics: '48 / 48' },
  { size: '4xl', metrics: '36 / 40' },
  { size: '3xl', metrics: '30 / 36' },
  { size: '2xl', metrics: '24 / 32' },
  { size: 'xl', metrics: '20 / 28' },
  { size: 'lg', metrics: '18 / 24' },
  { size: 'md', metrics: '16 / 24' },
  { size: 'sm', metrics: '14 / 20' },
] as const;

/**
 * The full ramp with its metrics. The bottom steps deliberately duplicate the text ramp — `sm`
 * is 14 on 20 exactly as in `Text` — because what separates them is semantic, not visual.
 */
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack gap={24} align='start'>
    {SIZES.map(({ size, metrics }) => (
      <VStack key={size} gap={4} align='start'>
        <Text size='xs' color='secondary'>
          size=&apos;{size}&apos; · {metrics}
        </Text>
        <Heading {...args} size={size}>
          The quick brown fox
        </Heading>
      </VStack>
    ))}
  </VStack>
);

/**
 * All four weights at every size, so weight emphasises within a level rather than creating one.
 */
export const Weights: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Heading {...args} size='3xl' weight='light'>
      Light Weight Heading
    </Heading>
    <Heading {...args} size='3xl' weight='regular'>
      Regular Weight Heading
    </Heading>
    <Heading {...args} size='3xl' weight='medium'>
      Medium Weight Heading
    </Heading>
    <Heading {...args} size='3xl' weight='bold'>
      Bold Weight Heading
    </Heading>
  </VStack>
);

/**
 * `asChild` moves the styling onto your own element, keeping whatever tag the surrounding
 * markup needs.
 */
export const AsChild: StoryFn<typeof meta> = ({ ...args }) => (
  <Heading {...args} size='4xl' weight='bold' asChild>
    <h2>Custom H2 Element with AsChild</h2>
  </Heading>
);

/**
 * `as` across the heading levels, which is the outline both a screen reader and a table of
 * contents read. Choose it from the document structure, not from the size you wanted.
 */
export const PolymorphicElements: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Heading {...args} as='h1' size='4xl'>
      H1 Heading
    </Heading>
    <Heading {...args} as='h2' size='3xl'>
      H2 Heading
    </Heading>
    <Heading {...args} as='h3' size='2xl'>
      H3 Heading
    </Heading>
    <Heading {...args} as='h4' size='xl'>
      H4 Heading
    </Heading>
    <Heading {...args} as='h5' size='lg'>
      H5 Heading
    </Heading>
    <Heading {...args} as='h6' size='md'>
      H6 Heading
    </Heading>
  </VStack>
);

/**
 * A heading rendered inline, for a title inside a row of other content where a block element
 * would break the line.
 */
export const AsSpan: StoryFn<typeof meta> = ({ ...args }) => (
  <Text>
    This is a paragraph with{' '}
    <Heading {...args} as='span' size='lg' weight='bold'>
      inline heading text
    </Heading>{' '}
    using span element.
  </Text>
);

/**
 * A heading with no document level at all, for text that looks like a title but should not
 * appear in the outline.
 */
export const AsDiv: StoryFn<typeof meta> = ({ ...args }) => (
  <Heading {...args} as='div' size='2xl' weight='medium'>
    This heading is rendered as a div element
  </Heading>
);
