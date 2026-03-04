import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { SegmentValue } from '../QueryBarChip/SegmentValue';

const meta = {
  title: 'QueryBar/Segments/SegmentValue',
  component: SegmentValue,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SegmentValue>;

export default meta;

export const Default: StoryFn<typeof meta> = () => <SegmentValue>value123</SegmentValue>;

export const LongText: StoryFn<typeof meta> = () => (
  <div className='w-200'>
    <SegmentValue>VeryLongValueThatShouldTruncateWithEllipsis</SegmentValue>
  </div>
);

export const VariousValues: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-8'>
    <SegmentValue>admin</SegmentValue>
    <SegmentValue>192.168.1.1</SegmentValue>
    <SegmentValue>2024-01-15</SegmentValue>
    <SegmentValue>42</SegmentValue>
  </div>
);
