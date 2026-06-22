import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { WallyIcon, type WallyIconProps } from './WallyIcon';

const meta = {
  title: 'Brand/WallyIcon',
  component: WallyIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The Wallarm`s AI assistant mascot icon (Wally). Supports simple and circle variants with multiple sizes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['simple', 'circle'],
      description: 'Visual style of the icon.',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Height of the icon (width scales proportionally).',
    },
  },
} satisfies Meta<typeof WallyIcon>;

export default meta;

export const Basic: StoryFn<WallyIconProps> = args => <WallyIcon {...args} />;

Basic.args = {
  variant: 'simple',
  size: 'md',
};

export const Styles: StoryFn<WallyIconProps> = args => (
  <VStack gap={12}>
    <HStack gap={32} justify='around'>
      <div>Simple</div>
      <div>Circle</div>
    </HStack>
    <HStack gap={32} justify='around'>
      <WallyIcon {...args} variant='simple' />
      <WallyIcon {...args} variant='circle' />
    </HStack>
  </VStack>
);

Styles.args = {
  size: 'xl',
};

export const Sizes: StoryFn<WallyIconProps> = args => (
  <HStack gap={48} justify='center' align='stretch'>
    <VStack gap={16} align='center'>
      <WallyIcon {...args} variant='simple' size='xs' />
      <WallyIcon {...args} variant='simple' size='sm' />
      <WallyIcon {...args} variant='simple' size='md' />
      <WallyIcon {...args} variant='simple' size='lg' />
      <WallyIcon {...args} variant='simple' size='xl' />
    </VStack>

    <VStack gap={16} align='center'>
      <WallyIcon {...args} variant='circle' size='xs' />
      <WallyIcon {...args} variant='circle' size='sm' />
      <WallyIcon {...args} variant='circle' size='md' />
      <WallyIcon {...args} variant='circle' size='lg' />
      <WallyIcon {...args} variant='circle' size='xl' />
    </VStack>
  </HStack>
);
