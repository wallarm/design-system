import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Check } from '../../icons';
import { HStack, VStack } from '../Stack';
import { NumericBadge } from './NumericBadge';

const DESCRIPTION = [
  'A compact count, `!` / `?` glyph, or icon attached to a tab, button, menu item, or step.',
  '`type` sets the visual weight and `color` sets the meaning. Supported combinations:',
  '- `solid`: `brand`, `danger`\n- `secondary`: `neutral`, `neutral-alt`, `info`, `success`, `danger`, `brand`\n- `outline`: `neutral`, `success`, `danger`, `brand`',
  'The default is `secondary` / `neutral`. With `type="solid"`, the default color is `brand`.',
  '`size="default"` corresponds to Medium (20px tall, 16px icon); `size="small"` is 16px tall with a 12px icon. Pass content as children and give an icon-only badge an accessible name when it conveys meaning.',
  'Hover and focus states apply to clickable badges. Use `asChild` with a native button or link when the badge is an action or navigation target.',
  'Migration from the removed flat `type` API:\n\n| Previous type | New type | New color |\n| --- | --- | --- |\n| `primary` | `secondary` | `neutral` |\n| `primary-alt` | `secondary` | `neutral-alt` |\n| `brand` | `solid` | `brand` |\n| `destructive` | `solid` | `danger` |\n| `outline` | `outline` | `neutral` |\n| `info` | `secondary` | `info` |',
].join('\n\n');

const combinations = [
  { type: 'solid', color: 'brand' },
  { type: 'solid', color: 'danger' },
  { type: 'secondary', color: 'neutral' },
  { type: 'secondary', color: 'neutral-alt' },
  { type: 'secondary', color: 'info' },
  { type: 'secondary', color: 'success' },
  { type: 'secondary', color: 'danger' },
  { type: 'secondary', color: 'brand' },
  { type: 'outline', color: 'neutral' },
  { type: 'outline', color: 'success' },
  { type: 'outline', color: 'danger' },
  { type: 'outline', color: 'brand' },
] as const;

const meta = {
  title: 'Status Indication/NumericBadge',
  component: NumericBadge,
  argTypes: {
    type: { control: 'select', options: ['solid', 'secondary', 'outline'] },
    color: {
      control: 'select',
      options: ['neutral', 'neutral-alt', 'brand', 'info', 'success', 'danger'],
    },
    size: { control: 'select', options: ['default', 'small'] },
  },
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
export const Basic: StoryFn<typeof meta> = args => <NumericBadge {...args}>1</NumericBadge>;

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
 * Every supported Type × Color combination, in Medium and Small.
 */
export const Types: StoryFn<typeof meta> = () => (
  // One row per type, so the label always sits beside the badges it names.
  <VStack gap={8} align='start'>
    {combinations.map(({ type, color }) => (
      <HStack key={`${type}-${color}`} gap={12} align='center'>
        <span className='sb-annotation w-256 whitespace-nowrap text-right'>
          {type} / {color}
        </span>
        <div
          className={`inline-flex items-center gap-12 p-8 ${color === 'neutral-alt' ? 'bg-component-tooltip-bg' : ''}`}
        >
          <NumericBadge type={type} color={color} size='default'>
            1
          </NumericBadge>
          <NumericBadge type={type} color={color} size='small'>
            1
          </NumericBadge>
        </div>
      </HStack>
    ))}
  </VStack>
);

/** Numbers, short glyphs, and icons share the same badge heights. */
export const Content: StoryFn<typeof meta> = () => (
  <VStack gap={16} align='start'>
    {(['default', 'small'] as const).map(size => (
      <HStack key={size} gap={12} align='center'>
        <span className='sb-annotation w-96 text-right'>{size}</span>
        <NumericBadge size={size}>1</NumericBadge>
        <NumericBadge size={size}>99</NumericBadge>
        <NumericBadge size={size} color='danger' aria-label='Needs attention'>
          !
        </NumericBadge>
        <NumericBadge size={size} color='info' aria-label='Unknown'>
          ?
        </NumericBadge>
        <NumericBadge size={size} color='success' aria-label='Completed'>
          <Check />
        </NumericBadge>
      </HStack>
    ))}
  </VStack>
);

/** Use a native button for an action; Tab, Enter, and Space work as expected. */
export const Clickable: StoryFn<typeof meta> = () => {
  const [activations, setActivations] = useState(0);

  return (
    <VStack gap={12} align='start'>
      {combinations.map(({ type, color }) => (
        <HStack key={`${type}-${color}`} gap={12} align='center'>
          <span className='sb-annotation w-256 whitespace-nowrap text-right'>
            {type} / {color}
          </span>
          <div className={color === 'neutral-alt' ? 'bg-component-tooltip-bg p-8' : 'p-8'}>
            <NumericBadge
              asChild
              type={type}
              color={color}
              onClick={() => setActivations(count => count + 1)}
            >
              <button type='button' aria-label={`${type} ${color}`}>
                1
              </button>
            </NumericBadge>
          </div>
        </HStack>
      ))}
      <output aria-label='Activations'>{activations}</output>
    </VStack>
  );
};
