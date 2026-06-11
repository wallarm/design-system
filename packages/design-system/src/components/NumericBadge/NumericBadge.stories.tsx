import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { NumericBadge } from './NumericBadge';

const meta = {
  title: 'Status Indication/NumericBadge',
  component: NumericBadge,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof NumericBadge>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => <NumericBadge>1</NumericBadge>;

export const Sizes: StoryFn<typeof meta> = () => (
  <HStack gap={12}>
    <VStack align='end'>
      <div>Small</div>
      <div>Default</div>
    </VStack>
    <VStack>
      <NumericBadge size='small'>1</NumericBadge>
      <NumericBadge size='default'>1</NumericBadge>
    </VStack>
  </HStack>
);

export const Types: StoryFn<typeof meta> = () => (
  <HStack gap={12} align='stretch'>
    <VStack align='end'>
      <div>Primary</div>
      <div>Brand</div>
      <div>Destructive</div>
      <div>Outline</div>
      <div>Info</div>
      <div>Primary-alt</div>
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
