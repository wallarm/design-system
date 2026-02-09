import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Loader } from './Loader';

const meta = {
  title: 'Loading/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Loader>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => <Loader />;

export const Types: StoryFn<typeof meta> = () => (
  <HStack>
    <Loader type='circle' />
    <Loader type='sonner' />
  </HStack>
);

export const Sizes: StoryFn<typeof meta> = () => (
  <VStack>
    <HStack>
      <Loader size='sm' />
      <Loader size='md' />
      <Loader size='lg' />
      <Loader size='xl' />
      <Loader size='2xl' />
      <Loader size='3xl' />
    </HStack>

    <HStack>
      <Loader type='sonner' size='sm' />
      <Loader type='sonner' size='md' />
      <Loader type='sonner' size='lg' />
      <Loader type='sonner' size='xl' />
      <Loader type='sonner' size='2xl' />
      <Loader type='sonner' size='3xl' />
    </HStack>
  </VStack>
);

export const Colors: StoryFn<typeof meta> = () => (
  <VStack>
    <HStack>
      <Loader color='primary' />
      <Loader color='brand' />
      <Loader color='danger' />
      <div className='flex gap-4 bg-slate-950'>
        <Loader color='primary-alt' />

        <Loader color='primary-alt-fixed' />
      </div>
    </HStack>

    <HStack>
      <Loader type='sonner' color='primary' />
      <Loader type='sonner' color='brand' />
      <Loader type='sonner' color='danger' />
      <div className='flex gap-4 bg-slate-950'>
        <Loader type='sonner' color='primary-alt' />

        <Loader type='sonner' color='primary-alt-fixed' />
      </div>
    </HStack>
  </VStack>
);

export const CircleBackground: StoryFn<typeof meta> = () => (
  <HStack>
    <Loader />
    <Loader background={false} />
  </HStack>
);
