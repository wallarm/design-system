import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { HStack, VStack } from '../Stack';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Loading/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rect', 'rounded'],
    },
    loading: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

export const Basic: StoryFn<typeof meta> = args => <Skeleton {...args} className='h-40 w-256' />;

export const Variants: StoryFn<typeof meta> = () => (
  <VStack className='gap-16 w-320'>
    <VStack className='gap-4'>
      <span className='text-sm text-text-secondary'>text</span>
      <Skeleton variant='text' />
    </VStack>

    <VStack className='gap-4'>
      <span className='text-sm text-text-secondary'>rect (default)</span>
      <Skeleton variant='rect' className='h-40 w-256' />
    </VStack>

    <VStack className='gap-4'>
      <span className='text-sm text-text-secondary'>rounded</span>
      <Skeleton variant='rounded' className='h-40 w-256' />
    </VStack>

    <VStack className='gap-4'>
      <span className='text-sm text-text-secondary'>circular</span>
      <Skeleton variant='circular' className='h-48 w-48' />
    </VStack>
  </VStack>
);

export const WithAsChild: StoryFn<typeof meta> = () => (
  <VStack className='gap-16'>
    <VStack className='gap-4'>
      <span className='text-sm text-text-secondary'>loading=true, asChild</span>
      <HStack className='gap-8'>
        <Skeleton asChild loading>
          <Badge>Select</Badge>
        </Skeleton>
        <Skeleton asChild loading>
          <Button>Submit</Button>
        </Skeleton>
      </HStack>
    </VStack>

    <VStack className='gap-4'>
      <span className='text-sm text-text-secondary'>loading=false (children rendered)</span>
      <HStack className='gap-8'>
        <Skeleton asChild loading={false}>
          <Badge>Select</Badge>
        </Skeleton>
        <Skeleton asChild loading={false}>
          <Button>Submit</Button>
        </Skeleton>
      </HStack>
    </VStack>
  </VStack>
);

export const LoadingToggle: StoryFn<typeof meta> = ({ loading = true }) => (
  <HStack className='gap-16'>
    <Skeleton loading={loading} className='h-48 w-48' variant='circular' />
    <VStack className='gap-8'>
      <Skeleton loading={loading} variant='text' className='w-200' />
      <Skeleton loading={loading} variant='text' className='w-128' />
    </VStack>
  </HStack>
);
LoadingToggle.args = { loading: true };

export const ShapeVariety: StoryFn<typeof meta> = () => (
  <VStack className='gap-16'>
    <HStack className='gap-16 items-center'>
      <Skeleton variant='circular' className='h-48 w-48' />
      <VStack className='gap-8 flex-1'>
        <Skeleton variant='text' className='w-200' />
        <Skeleton variant='text' className='w-128' />
      </VStack>
    </HStack>

    <HStack className='gap-16 items-center'>
      <Skeleton variant='circular' className='h-36 w-36' />
      <VStack className='gap-8 flex-1'>
        <Skeleton variant='text' className='w-160' />
        <Skeleton variant='text' className='w-96' />
      </VStack>
    </HStack>
  </VStack>
);

export const CardExample: StoryFn<typeof meta> = () => (
  <VStack className='gap-12 w-320'>
    <Skeleton variant='rounded' className='h-160 w-full' />
    <Skeleton variant='text' className='w-200' />
    <Skeleton variant='text' />
    <Skeleton variant='text' className='w-240' />
    <HStack className='gap-8'>
      <Skeleton variant='rounded' className='h-36 w-100' />
      <Skeleton variant='circular' className='h-36 w-36' />
    </HStack>
  </VStack>
);
