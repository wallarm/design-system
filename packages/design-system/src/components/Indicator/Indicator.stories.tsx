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
  // Fixed-width cells so each size heading sits over its own column: the dots are 6 and 8px, far
  // narrower than the words above them, so without a shared width nothing lines up.
  <VStack gap={16} align='start'>
    <HStack gap={24} align='center'>
      <span className='sb-annotation w-32 text-center'>sm</span>
      <span className='sb-annotation w-32 text-center'>md</span>
    </HStack>

    {colors.map(color => (
      <HStack key={color} gap={24} align='center'>
        <div className='flex w-32 justify-center'>
          <Indicator size='sm' color={color} />
        </div>
        <div className='flex w-32 justify-center'>
          <Indicator size='md' color={color} />
        </div>
        <span className='sb-annotation'>{color}</span>
      </HStack>
    ))}
  </VStack>
);
