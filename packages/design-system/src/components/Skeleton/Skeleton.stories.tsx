import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild';
import { CircleDashed, Globe } from '../../icons';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Heading } from '../Heading';
import { SegmentedTabs, SegmentedTabsList, SegmentedTabsTrigger } from '../SegmentedTabs';
import { Tag } from '../Tag';
import { TagClose } from '../Tag/TagClose';
import { Text } from '../Text';
import { Skeleton, type SkeletonProps } from './Skeleton';

const meta = {
  title: 'Loading/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Skeleton placeholder for loading states. ' +
          'Uses pulse animation (opacity fade in/out). ' +
          'Default size: width 100%, height 20px. Use width/height props (px, %, vw/vh). ' +
          'Default radius: 6px (rounded-6), adjustable via rounded prop to match component shape. ' +
          'Transparent mode: slate-600 gradient (6% → 16% → 6% → 16%). ' +
          'Non-transparent mode: surface-1 background + slate-600 gradient (6% → 16% → 6% → 16%).',
      },
    },
  },
  argTypes: {
    width: {
      control: 'number',
    },
    height: {
      control: 'number',
    },
    rounded: {
      control: 'number',
    },
    animated: {
      control: 'boolean',
    },
    transparent: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

export const Basic: StoryObj<typeof meta> = {
  args: {
    width: 200,
    height: 20,
    rounded: 6,
    animated: true,
    transparent: true,
    loading: true,
    children: 'Loaded element',
  },
};

export const Shapes: StoryFn<SkeletonProps> = () => (
  <div className='flex gap-24'>
    <div className='flex flex-col items-end gap-24 w-[400px]'>
      {/* Title */}
      <Skeleton width={256} height={40} />

      {/* Text */}
      <Skeleton width={256} height={24} />

      {/* Tags row */}
      <div className='flex flex-row gap-4'>
        <Skeleton width={48} height={24} />
        <Skeleton width={48} height={24} />
        <Skeleton width={48} height={24} />
        <Skeleton width={48} height={24} />
      </div>

      {/* Icon Button */}
      <Skeleton width={36} height={36} />

      {/* Circle + text + badge */}
      <div className='flex flex-row items-center gap-4'>
        <Skeleton width={20} height={20} rounded={100} />
        <Skeleton width={88} />
        <Skeleton width={32} />
      </div>

      {/* Button */}
      <Skeleton width={100} height={36} rounded={8} />

      {/* Segmented tabs */}
      <Skeleton width={284} height={36} rounded={12} />
    </div>

    <div className='flex flex-col gap-24 w-[400px]'>
      {/* Title */}
      <Heading size='4xl'>Advanced API Security</Heading>

      {/* Text */}
      <Text size='md'>Advanced API Security</Text>

      {/* Tags row */}
      <div className='flex flex-row gap-4'>
        <Tag>
          Tag
          <TagClose />
        </Tag>
        <Tag>
          Tag
          <TagClose />
        </Tag>
        <Tag>
          Tag
          <TagClose />
        </Tag>
        <Badge>+5</Badge>
      </div>

      {/* Icon Button */}
      <Button variant='outline' color='neutral' size='large'>
        <CircleDashed />
      </Button>

      {/* Circle + text + badge */}
      <div className='flex flex-row items-center gap-4'>
        <Globe className='size-[20px] text-text-secondary' />
        <Text size='md'>34.74.73.20</Text>
        <Badge>AWS</Badge>
      </div>

      {/* Button */}
      <div className='flex w-100'>
        <Button variant='primary' color='brand' size='large'>
          <CircleDashed />
          Button
        </Button>
      </div>

      {/* Segmented tabs */}
      <div className='flex w-284'>
        <SegmentedTabs defaultValue='item1'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='item1'>Item</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='item2'>Item</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='item3'>Item</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='item4'>Item</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='item5'>Item</SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </div>
    </div>
  </div>
);

export const Transparent: StoryFn<SkeletonProps> = () => (
  <div className='flex flex-col gap-8 p-8 rounded-8 bg-orange-100'>
    <div className='flex gap-24 justify-end'>
      Transparent: <Skeleton width={200} />
    </div>
    <div className='flex gap-24 justify-end'>
      Not transparent: <Skeleton width={200} transparent={false} />
    </div>
  </div>
);

export const Animated: StoryFn<SkeletonProps> = () => (
  <div className='flex flex-col gap-8'>
    <div className='flex gap-24 justify-end'>
      Animated: <Skeleton width={200} />
    </div>
    <div className='flex gap-24 justify-end'>
      Not animated: <Skeleton width={200} animated={false} />
    </div>
  </div>
);
