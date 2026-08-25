import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../Stack';
import { Loader } from './Loader';

const DESCRIPTION = [
  'A spinner for a short, in-context wait you cannot measure — one thing at a time, placed where the waiting is happening.',
  'Reach for `Skeleton` when a page, list or table is loading a layout you already know, and for `Progress` when you can measure the wait or it runs past about ten seconds, where a spinner starts to read as frozen; a `Button` carries its own loading state, so never put one beside a button.',
  'It ships no label and no live region of its own, so the announcement has to come from a `role="status"` element around it.',
].join(' ');

const meta = {
  title: 'Loading/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Loader>;

export default meta;

/** The default: a `circle` at `xl`, and always indeterminate — there is no determinate spinner, because that is `Progress`. */
export const Basic: StoryFn<typeof meta> = () => <Loader />;

/** `circle` beside `sonner`, the radial fade. Pick one for a surface and stay with it rather than mixing both in a view. */
export const Types: StoryFn<typeof meta> = () => (
  <HStack>
    <Loader type='circle' />
    <Loader type='sonner' />
  </HStack>
);

/** `sm` to `3xl`, 12px to 48px. The small end is for inline waits inside a field or a row; `xl` and up are for a spinner centred in a panel. */
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

/** The icon colours, with `primary-alt` and `primary-alt-fixed` for dark surfaces. With no `color` set the spinner simply takes the current text colour, which is usually what you want. */
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

/** `background={false}` drops the faint track ring behind the circle — worth it on a surface where the ring reads as a border. It applies to `circle` only. */
export const CircleBackground: StoryFn<typeof meta> = () => (
  <HStack>
    <Loader />
    <Loader background={false} />
  </HStack>
);
