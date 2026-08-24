import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Indicator } from './Indicator';

const colors = ['info', 'brand', 'danger', 'warning', 'success', 'ai'] as const;

const DESCRIPTION = [
  'A coloured dot for a state next to something that already names it — a row, a tab, an item in a list.',
  'Reach for `Badge` when the state needs naming, since colour on its own carries nothing for a reader who cannot separate the hues.',
].join(' ');

const meta = {
  title: 'Status Indication/Indicator',
  component: Indicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    color: {
      control: 'select',
      options: colors,
    },
  },
} satisfies Meta<typeof Indicator>;

export default meta;

/**
 * The default dot. It only works where the thing beside it is already labelled — the dot
 * qualifies that label rather than replacing it.
 */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => <Indicator {...args} />;

/**
 * Both sizes against every colour. The colours mean what they mean everywhere else in the
 * system, so pick from meaning rather than from contrast.
 */
export const AllVariants: StoryFn<typeof meta> = () => (
  <VStack gap={12}>
    <HStack align='center' gap={8}>
      <span className='sb-annotation'>sm</span>
      <span className='sb-annotation'>md</span>
    </HStack>
    {colors.map(color => (
      <HStack key={color} align='center' gap={24}>
        <Indicator size='sm' color={color} />
        <Indicator size='md' color={color} />
        <span className='sb-annotation'>{color}</span>
      </HStack>
    ))}
  </VStack>
);
