import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { NumericBadge } from './NumericBadge';

const DESCRIPTION = [
  'A count attached to whatever it sits beside — a tab, a button, a menu item.',
  'It is not a `Badge`: there is no status meaning here, just the number, so use it where the reader wants to know how many rather than what kind.',
].join(' ');

const meta = {
  title: 'Status Indication/NumericBadge',
  component: NumericBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof NumericBadge>;

export default meta;

/**
 * The default count. Keep it to what the reader can take in at a glance; a four-digit count is
 * a number they need to read, not see.
 */
export const Basic: StoryFn<typeof meta> = () => <NumericBadge>1</NumericBadge>;

/**
 * Two heights, chosen to sit inside the control they are attached to rather than beside it.
 */
export const Sizes: StoryFn<typeof meta> = () => (
  // One row per size, each holding its own label: parallel columns drift apart as soon as the
  // label and the specimen have different heights.
  <VStack gap={8} align='start'>
    {(['small', 'default'] as const).map(size => (
      <HStack key={size} gap={12} align='center'>
        <span className='sb-annotation w-96 text-right'>{size}</span>
        <NumericBadge size={size}>1</NumericBadge>
      </HStack>
    ))}
  </VStack>
);

/**
 * The palette, including `destructive` and `brand`. Reach for a plain type unless the count
 * itself is the thing demanding attention.
 */
export const Types: StoryFn<typeof meta> = () => (
  // One row per type, so the label always sits beside the badges it names.
  <VStack gap={8} align='start'>
    {(['primary', 'brand', 'destructive', 'outline', 'info'] as const).map(type => (
      <HStack key={type} gap={12} align='center'>
        <span className='sb-annotation w-144 text-right'>{type}</span>
        <NumericBadge type={type} size='default'>
          1
        </NumericBadge>
        <NumericBadge type={type} size='small'>
          1
        </NumericBadge>
      </HStack>
    ))}

    <HStack gap={12} align='center'>
      <span className='sb-annotation w-144 text-right'>primary-alt</span>
      <div className='inline-flex items-center gap-12 bg-component-tooltip-bg p-8'>
        <NumericBadge type='primary-alt' size='default'>
          1
        </NumericBadge>
        <NumericBadge type='primary-alt' size='small'>
          1
        </NumericBadge>
      </div>
    </HStack>
  </VStack>
);
