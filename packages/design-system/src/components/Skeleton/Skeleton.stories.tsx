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

const DESCRIPTION = [
  'A content-shaped placeholder for a region whose layout you know but whose data has not landed — it shortens the perceived wait and stops the page jumping when the content arrives.',
  'Reach for it on the first or full load of a page, list, card or table; a single inline wait is a `Loader`, a measurable one is `Progress`, and a wait under a second wants nothing at all. Never put a skeleton and a spinner in the same region.',
  'The root is `aria-hidden`, so the loading announcement has to come from a live region of your own.',
].join(' ');

const meta = {
  title: 'Loading/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
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

/** One sized box. `width` and `height` take any CSS length, and `rounded` should match the shape of whatever is coming. */
export const Basic: StoryFn<typeof meta> = () => <Skeleton width='200px' height='20px' />;

/** Standalone boxes built to match the real components beside them. The point of the comparison is the measurements: a placeholder that is not the content’s size is what makes the page jump on swap-in. */
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

/** The cleaner way — wrap the real content and toggle `loading`. The skeleton takes the content’s exact box, so there is nothing to keep in sync by hand. */
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

/** `transparent`, the default, animates over invisible content so the surface behind shows through; `transparent={false}` fills the box with `surface-1`. */
export const Transparent: StoryFn<SkeletonProps> = () => (
  <div className='flex flex-col gap-8 p-8 rounded-8 bg-orange-100'>
    <div className='flex items-center justify-end gap-24'>
      <span className='sb-annotation'>transparent</span>
      <Skeleton width='200px' height='20px' />
    </div>
    <div className='flex items-center justify-end gap-24'>
      <span className='sb-annotation'>filled</span>
      <Skeleton width='200px' height='20px' transparent={false} />
    </div>
  </div>
);
