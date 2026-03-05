import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CircleDashed, Globe } from '../../icons';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Heading } from '../Heading';
import { SegmentedTabs, SegmentedTabsList, SegmentedTabsTrigger } from '../SegmentedTabs';
import { HStack } from '../Stack';
import { Tag, TagClose } from '../Tag';
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
    transparent: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => <Skeleton width='200px' height='20px' />;

export const Shapes: StoryFn<SkeletonProps> = () => (
  <HStack gap={24} align='start'>
    <div className='flex flex-col items-end gap-24 w-[400px]'>
      {/* Title */}
      <Skeleton width='256px' height='40px' />

      {/* Text */}
      <Skeleton width='256px' height='24px' />

      {/* Tags row */}
      <HStack gap={4}>
        <Skeleton width='48px' height='20px' />
        <Skeleton width='48px' height='20px' />
        <Skeleton width='48px' height='20px' />
        <Skeleton width='48px' height='20px' />
      </HStack>

      {/* Icon Button */}
      <Skeleton width='36px' height='36px' />

      {/* Circle + text + badge */}
      <HStack align='center' gap={4}>
        <Skeleton width='20px' height='24px' rounded='full' />
        <Skeleton width='88px' height='24px' />
        <Skeleton width='32px' height='24px' />
      </HStack>

      {/* Button */}
      <Skeleton width='100px' height='36px' rounded={8} />

      {/* Segmented tabs */}
      <Skeleton width='284px' height='36px' rounded={12} />
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
  </HStack>
);

export const Wrap: StoryFn<SkeletonProps> = () => (
  <HStack gap={24} align='start'>
    <div className='flex flex-col items-end gap-24 w-[400px]'>
      {/* Title */}
      <Skeleton>
        <Heading size='4xl'>Advanced API Security</Heading>
      </Skeleton>

      {/* Text */}
      <Skeleton>
        <Text size='md'>Advanced API Security</Text>
      </Skeleton>

      {/* Tags row */}
      <HStack gap={4}>
        <Skeleton>
          <Tag>
            Tag
            <TagClose />
          </Tag>
        </Skeleton>
        <Skeleton>
          <Tag>
            Tag
            <TagClose />
          </Tag>
        </Skeleton>
        <Skeleton>
          <Tag>
            Tag
            <TagClose />
          </Tag>
        </Skeleton>
        <Skeleton>
          <Badge>+5</Badge>
        </Skeleton>
      </HStack>

      {/* Icon Button */}
      <Skeleton rounded={8}>
        <Button variant='outline' color='neutral' size='large'>
          <CircleDashed />
        </Button>
      </Skeleton>

      {/* Circle + text + badge */}
      <HStack align='center' gap={4}>
        <Skeleton rounded='full'>
          <Globe className='size-[20px] text-text-secondary' />
        </Skeleton>
        <Skeleton>
          <Text size='md'>34.74.73.20</Text>
        </Skeleton>
        <Skeleton>
          <Badge>AWS</Badge>
        </Skeleton>
      </HStack>

      {/* Button */}
      <Skeleton rounded={8}>
        <Button variant='primary' color='brand' size='large'>
          <CircleDashed />
          Button
        </Button>
      </Skeleton>

      {/* Segmented tabs */}
      <Skeleton rounded={12}>
        <SegmentedTabs defaultValue='item1'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='item1'>Item</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='item2'>Item</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='item3'>Item</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='item4'>Item</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='item5'>Item</SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </Skeleton>
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
  </HStack>
);

export const Transparent: StoryFn<SkeletonProps> = () => (
  <div className='flex flex-col gap-8 p-8 rounded-8 bg-orange-100'>
    <div className='flex gap-24 justify-end'>
      Transparent: <Skeleton width='200px' height='20px' />
    </div>
    <div className='flex gap-24 justify-end'>
      Not transparent: <Skeleton width='200px' height='20px' transparent={false} />
    </div>
  </div>
);
