import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Text } from './Text';

const DESCRIPTION = [
  'Geist for body copy, labels and UI text — the default choice for anything the user reads as prose.',
  'All four weights exist at every size. Weight carries emphasis and colour carries de-emphasis, so neither is done by changing size. Step down for denser UI, not to build hierarchy.',
  'Titles and links have their own ramps: reach for `Heading` when the text is a title and `Link` when it navigates.',
  'Known gap: `size="md"` applies no font size of its own and inherits from its container, so it renders whatever surrounds it. The Sizes story below shows it beside `lg` — prefer an explicit step until that is fixed.',
].join('\n\n');

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

export const AsChild: StoryFn<typeof meta> = ({ ...args }) => (
  <Text {...args} size='lg' weight='medium' asChild>
    <span>Custom Span Element with AsChild</span>
  </Text>
);
