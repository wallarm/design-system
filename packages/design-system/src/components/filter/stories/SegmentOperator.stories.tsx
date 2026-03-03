import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { SegmentOperator } from '../primitives/SegmentOperator';

const meta = {
  title: 'Filter/Segments/SegmentOperator',
  component: SegmentOperator,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SegmentOperator>;

export default meta;

export const Default: StoryFn<typeof meta> = () => <SegmentOperator>is</SegmentOperator>;

export const LongText: StoryFn<typeof meta> = () => (
  <div className='w-200'>
    <SegmentOperator>contains very long operator text</SegmentOperator>
  </div>
);

export const AllOperators: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-8'>
    <SegmentOperator>is</SegmentOperator>
    <SegmentOperator>is not</SegmentOperator>
    <SegmentOperator>contains</SegmentOperator>
    <SegmentOperator>does not contain</SegmentOperator>
    <SegmentOperator>greater than</SegmentOperator>
  </div>
);
