import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Logo, type LogoProps } from './Logo';

const meta = {
  title: 'Brand/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The Wallarm brand logo. Supports icon-only, wordmark-only, and full (icon + wordmark) variants with multiple color styles and sizes.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['icon', 'wordmark', 'full'],
      description: 'Which logo form to render.',
    },
    color: {
      control: 'select',
      options: ['default', 'white', 'full-white'],
      description: 'Color style of the logo.',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Height of the logo (width scales proportionally).',
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;

export const Basic: StoryFn<LogoProps> = args => <Logo {...args} />;

Basic.args = {
  type: 'full',
  color: 'default',
  size: 'lg',
};

export const Types: StoryFn<LogoProps> = args => (
  <HStack gap={96} justify='between' fullWidth>
    <Logo {...args} type='icon' />
    <Logo {...args} type='wordmark' />
    <Logo {...args} type='full' />
  </HStack>
);

Types.args = {
  size: 'xl',
  color: 'default',
};

export const Styles: StoryFn<LogoProps> = args => (
  <VStack gap={16}>
    <div className='rounded-8 px-16 py-8'>
      <HStack gap={96} justify='between' fullWidth>
        <Logo {...args} type='icon' color='default' />
        <Logo {...args} type='wordmark' color='default' />
        <Logo {...args} type='full' color='default' />
      </HStack>
    </div>
    <div className='rounded-8 bg-slate-900 px-16 py-8'>
      <HStack gap={96} justify='between' fullWidth>
        <Logo {...args} type='icon' color='white' />
        <Logo {...args} type='wordmark' color='white' />
        <Logo {...args} type='full' color='white' />
      </HStack>
    </div>
    <div className='rounded-8 bg-slate-900 px-16 py-8'>
      <HStack gap={96} justify='between' fullWidth>
        <Logo {...args} type='icon' color='full-white' />
        <Logo {...args} type='wordmark' color='full-white' />
        <Logo {...args} type='full' color='full-white' />
      </HStack>
    </div>
  </VStack>
);

Styles.args = {
  size: 'xl',
};

export const Sizes: StoryFn<LogoProps> = args => (
  <HStack gap={96} justify='between' fullWidth>
    <VStack gap={16} align='start'>
      <Logo {...args} type='icon' size='xs' />
      <Logo {...args} type='icon' size='sm' />
      <Logo {...args} type='icon' size='md' />
      <Logo {...args} type='icon' size='lg' />
      <Logo {...args} type='icon' size='xl' />
      <Logo {...args} type='icon' size='2xl' />
    </VStack>
    <VStack gap={16} align='start'>
      <Logo {...args} type='wordmark' size='xs' />
      <Logo {...args} type='wordmark' size='sm' />
      <Logo {...args} type='wordmark' size='md' />
      <Logo {...args} type='wordmark' size='lg' />
      <Logo {...args} type='wordmark' size='xl' />
      <Logo {...args} type='wordmark' size='2xl' />
    </VStack>
    <VStack gap={16} align='start'>
      <Logo {...args} type='full' size='xs' />
      <Logo {...args} type='full' size='sm' />
      <Logo {...args} type='full' size='md' />
      <Logo {...args} type='full' size='lg' />
      <Logo {...args} type='full' size='xl' />
      <Logo {...args} type='full' size='2xl' />
    </VStack>
  </HStack>
);

Sizes.args = {
  color: 'default',
};
