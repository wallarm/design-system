import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { WallyIcon, type WallyIconProps } from './WallyIcon';

const DESCRIPTION = [
  'Wally, the mascot for Wallarm’s AI assistant — the mark that signals an AI surface rather than a general-purpose icon, so keep it for the assistant and reach for the icon set for everything else.',
  '`simple` is the bare mark and `circle` wraps it in its own badge so it can sit on a coloured surface; both are sized by height from 16px to 64px, with the width following.',
].join(' ');

const meta = {
  title: 'Brand/WallyIcon',
  component: WallyIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
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

/** Wally at the defaults — `simple` at `md`, which is 24px tall. */
export const Basic: StoryFn<WallyIconProps> = args => <WallyIcon {...args} />;

Basic.args = {
  variant: 'simple',
  size: 'md',
};

/** The two variants side by side. The badge is what lets the mark keep its edge on a coloured or busy surface; on a plain panel the bare mark is enough. */
export const Styles: StoryFn<WallyIconProps> = args => (
  <HStack gap={32} justify='around' align='start'>
    <VStack gap={8} align='center'>
      <span className='sb-annotation'>simple</span>
      <WallyIcon {...args} variant='simple' />
    </VStack>
    <VStack gap={8} align='center'>
      <span className='sb-annotation'>circle</span>
      <WallyIcon {...args} variant='circle' />
    </VStack>
  </HStack>
);

Styles.args = {
  size: 'xl',
};

/** `xs` to `xl` in both variants. Worth reading down the columns to see where the detail in the bare mark gives out and the badge stops helping. */
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
