import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { SegmentAttribute } from './SegmentAttribute';

const meta = {
  title: 'Filter/Segments/SegmentAttribute',
  component: SegmentAttribute,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SegmentAttribute>;

export default meta;

export const Default: StoryFn<typeof meta> = () => <SegmentAttribute>Attribute</SegmentAttribute>;

export const LongText: StoryFn<typeof meta> = () => (
  <div className='w-200'>
    <SegmentAttribute>VeryLongAttributeNameThatShouldTruncate</SegmentAttribute>
  </div>
);

export const CustomClassName: StoryFn<typeof meta> = () => (
  <SegmentAttribute className='bg-blue-100'>Custom Styled</SegmentAttribute>
);
