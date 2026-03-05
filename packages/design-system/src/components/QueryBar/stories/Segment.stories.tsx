import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Segment } from '../QueryBarInput';

const meta = {
  title: 'QueryBar/Segments/Segment',
  component: Segment,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Segment>;

export default meta;

export const Attribute: StoryFn<typeof meta> = () => <Segment variant='attribute'>IP Address</Segment>;

export const Operator: StoryFn<typeof meta> = () => <Segment variant='operator'>is</Segment>;

export const Value: StoryFn<typeof meta> = () => <Segment variant='value'>192.168.1.1</Segment>;

export const AllVariants: StoryFn<typeof meta> = () => (
  <div className='flex gap-4'>
    <Segment variant='attribute'>Country</Segment>
    <Segment variant='operator'>is not</Segment>
    <Segment variant='value'>United States</Segment>
  </div>
);

export const LongText: StoryFn<typeof meta> = () => (
  <div className='w-200'>
    <Segment variant='value'>VeryLongValueThatShouldTruncateWithEllipsis</Segment>
  </div>
);
