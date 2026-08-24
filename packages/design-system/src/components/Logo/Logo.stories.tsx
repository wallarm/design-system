import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Logo, type LogoProps } from './Logo';

const DESCRIPTION = [
  'The Wallarm logo in its three forms — `icon`, `wordmark` and `full` — sized by height, with the width following.',
  '`color` is a decision about the surface rather than a style choice: `default` on light, `white` on a dark surface where the mark should keep its brand colour, and `full-white` only where the whole lockup has to be a single colour.',
  'It renders a bare `svg` with no accessible name, so pass an `aria-label` where the logo is the only thing naming a link, and leave it unlabelled where a heading beside it already does.',
].join(' ');

const meta = {
  title: 'Brand/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
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

/** Every knob live. The defaults are `full` at `lg`, which is 20px tall. */
export const Basic: StoryFn<LogoProps> = args => <Logo {...args} />;

Basic.args = {
  type: 'full',
  color: 'default',
  size: 'lg',
};

/** The three forms at one height: the icon alone where space is tight, the wordmark where the mark already appears nearby, and the full lockup everywhere else. */
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

/** Each colour style on the surface it is for. `white` keeps the icon’s brand colour and turns only the wordmark white; `full-white` gives up the colour entirely. */
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

/** `xs` to `2xl`, 10px to 32px of height. The three forms sit side by side because the same height buys three very different footprints — 34, 75 and 118 units of viewBox width. */
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
