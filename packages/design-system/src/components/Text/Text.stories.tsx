import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Text } from './Text';

const DESCRIPTION = [
  'Geist for body copy, labels and anything read as prose — reach for `Heading` when the text is a title and `Link` when it navigates.',
  'Weight carries emphasis and colour carries de-emphasis, so build hierarchy from those rather than by changing size.',
].join(' ');

const meta = {
  title: 'Typography/Text',
  component: Text,
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
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'bold'],
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Text>;

export default meta;

/**
 * The default step. Text inherits its colour from the surroundings, which is why de-emphasis is
 * a deliberate choice rather than the absence of one.
 */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => (
  <Text {...args}>Default body text</Text>
);

/** Size / leading in px, measured from the rendered component. */
const SIZES = [
  { size: 'xl', metrics: '18 / 28' },
  { size: 'lg', metrics: '16 / 24' },
  { size: 'md', metrics: 'inherits from its container — see the note above' },
  { size: 'sm', metrics: '14 / 20' },
  { size: 'xs', metrics: '12 / 16' },
] as const;

/**
 * The ramp, for density rather than hierarchy — step down in a dense table, not to signal that
 * something matters less. Note that `md` sets no size of its own and inherits from its
 * container, so prefer an explicit step until that is fixed.
 */
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack gap={24} align='start'>
    {SIZES.map(({ size, metrics }) => (
      <VStack key={size} gap={4} align='start'>
        <Text size='xs' color='secondary'>
          size=&apos;{size}&apos; · {metrics}
        </Text>
        <Text {...args} size={size}>
          The quick brown fox jumps over the lazy dog
        </Text>
      </VStack>
    ))}
  </VStack>
);

/**
 * All four weights at one size. Weight is emphasis within a level, never a way to create one.
 */
export const Weights: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Text {...args} size='lg' weight='light'>
      Light Weight Body Text
    </Text>
    <Text {...args} size='lg' weight='regular'>
      Regular Weight Body Text
    </Text>
    <Text {...args} size='lg' weight='medium'>
      Medium Weight Body Text
    </Text>
    <Text {...args} size='lg' weight='bold'>
      Bold Weight Body Text
    </Text>
  </VStack>
);

/**
 * The de-emphasis ladder. Colour is how text recedes; a smaller size only makes it harder to
 * read.
 */
export const Colors: StoryFn<typeof meta> = ({ ...args }) => (
  <VStack align='start'>
    <Text {...args} color='primary'>
      Primary color text
    </Text>
    <Text {...args} color='primary-alt'>
      Primary alt color text
    </Text>
    <Text {...args} color='secondary'>
      Secondary color text
    </Text>
    <Text {...args} color='secondary-alt'>
      Secondary alt color text
    </Text>
    <Text {...args} color='tertiary-alt'>
      Tertiary alt color text
    </Text>
  </VStack>
);

/**
 * `asChild` puts the typography on your own element, for when the tag matters to the document
 * but the styling should still come from here.
 */
export const AsChild: StoryFn<typeof meta> = ({ ...args }) => (
  <Text {...args} size='lg' weight='medium' asChild>
    <span>Custom Span Element with AsChild</span>
  </Text>
);
