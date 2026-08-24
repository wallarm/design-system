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
  <HStack gap={12}>
    <VStack align='end'>
      <span className='sb-annotation'>Small</span>
      <span className='sb-annotation'>Default</span>
    </VStack>
    <VStack>
      <NumericBadge size='small'>1</NumericBadge>
      <NumericBadge size='default'>1</NumericBadge>
    </VStack>
  </HStack>
);

/**
 * The palette, including `destructive` and `brand`. Reach for a plain type unless the count
 * itself is the thing demanding attention.
 */
export const Types: StoryFn<typeof meta> = () => (
  <HStack gap={12} align='stretch'>
    <VStack align='end'>
      <span className='sb-annotation'>Primary</span>
      <span className='sb-annotation'>Brand</span>
      <span className='sb-annotation'>Destructive</span>
      <span className='sb-annotation'>Outline</span>
      <span className='sb-annotation'>Info</span>
      <span className='sb-annotation'>Primary-alt</span>
    </VStack>

    <VStack justify='between'>
      <NumericBadge type='primary' size='default' onClick={() => console.log('meow')}>
        1
      </NumericBadge>
      <NumericBadge type='brand' size='default' onClick={() => console.log('meow')}>
        1
      </NumericBadge>
      <NumericBadge type='destructive' size='default' onClick={() => console.log('meow')}>
        1
      </NumericBadge>
      <NumericBadge type='outline' size='default' onClick={() => console.log('meow')}>
        1
      </NumericBadge>
      <NumericBadge type='info' size='default' onClick={() => console.log('meow')}>
        1
      </NumericBadge>
      <div className='inline-flex bg-component-tooltip-bg'>
        <NumericBadge type='primary-alt' size='default' onClick={() => console.log('meow')}>
          1
        </NumericBadge>
      </div>
    </VStack>

    <VStack justify='around'>
      <NumericBadge type='primary' size='small'>
        1
      </NumericBadge>
      <NumericBadge type='brand' size='small'>
        1
      </NumericBadge>
      <NumericBadge type='destructive' size='small'>
        1
      </NumericBadge>
      <NumericBadge type='outline' size='small'>
        1
      </NumericBadge>
      <NumericBadge type='info' size='small'>
        1
      </NumericBadge>
      <div className='inline-flex bg-component-tooltip-bg'>
        <NumericBadge type='primary-alt' size='small'>
          1
        </NumericBadge>
      </div>
    </VStack>
  </HStack>
);
