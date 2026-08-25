import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { ProgressColorEnum } from './constants';
import type { ProgressProps } from './Progress';
import { Progress } from './Progress';

const DESCRIPTION = [
  'A linear bar for an operation you can measure, or a long or multi-step one where watching it advance is the reassurance — a short in-context wait is a `Loader`, and a page loading a known layout is `Skeleton`.',
  '`value={null}` makes it indeterminate: use that rather than a spinner for a long wait you cannot measure, switch to a real number the moment you can, and never fake a percentage.',
  'Linear only — the system has no circular progress, so do not hand-roll a ring.',
].join(' ');

const meta = {
  title: 'Loading/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'number', min: 1 },
    },
    min: {
      control: { type: 'number' },
    },
    max: {
      control: { type: 'number', min: 1 },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    color: {
      control: 'select',
      options: Object.values(ProgressColorEnum),
    },
    showLabel: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;

/** The determinate bar: `value` against `min` and `max`. The controls are live, so this is also the place to try a size or a colour. */
export const Basic: StoryFn<ProgressProps> = args => (
  <div className='w-280'>
    <Progress {...args} />
  </div>
);

Basic.args = {
  value: 70,
  min: 0,
  max: 100,
  size: 'xs',
  color: 'brand',
  showLabel: false,
};

const sizeRows = [
  { size: 'xs', label: 'xs (default)', value: 20 },
  { size: 'sm', label: 'sm', value: 40 },
  { size: 'md', label: 'md', value: 60 },
  { size: 'lg', label: 'lg', value: 80 },
] as const;

/** `xs` through `lg`. A thin bar belongs in an inline row; the heavier ones are for an operation the screen is actually about. */
export const Sizes: StoryFn<typeof meta> = () => (
  <div className='flex w-[360px] flex-col gap-16'>
    {sizeRows.map(({ size, label, value }) => (
      <div key={size} className='flex items-center gap-16'>
        <span className='sb-annotation w-[112px] shrink-0'>{label}</span>
        <Progress value={value} size={size} className='flex-1' />
      </div>
    ))}
  </div>
);

/** `showLabel` prints the percentage — worth it on a long or standalone job where the number reassures, noise on a thin inline bar. */
export const WithLabel: StoryFn<typeof meta> = () => (
  <div className='w-280'>
    <VStack>
      <Progress value={20} showLabel />
      <Progress value={40} showLabel size='sm' />
      <Progress value={60} showLabel size='md' />
      <Progress value={80} showLabel size='lg' />
    </VStack>
  </div>
);

/** The full palette, though `brand` is the default for a reason: reach for another only when the colour says something true about the job, such as red for one that is failing. */
export const Colors: StoryFn<typeof meta> = () => (
  <div className='flex w-[360px] flex-col gap-16'>
    {Object.entries(ProgressColorEnum).map(([key, color], index) => (
      <div key={color} className='flex items-center gap-16'>
        <span className='sb-annotation w-[112px] shrink-0'>{key}</span>
        <Progress
          value={index + 1}
          max={Object.entries(ProgressColorEnum).length}
          color={color}
          size='sm'
          className='flex-1'
        />
      </div>
    ))}
  </div>
);

/** `value={null}` cycles the range instead of filling it, which is the honest way to show a long wait you cannot measure. */
export const Indeterminate: StoryFn<typeof meta> = () => (
  <div className='w-280'>
    <Progress value={null} />
  </div>
);
