import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { AnimatedBackground, type AnimatedBackgroundProps } from './AnimatedBackground';

const DESCRIPTION = [
  'The decorative backdrop behind the surfaces that have no chrome of their own — sign-in, the splash screen, the assistant. `pixel`, the default, sweeps a canvas dot grid; `blur` drifts a mesh gradient. Children sit centred above it.',
  'It is `aria-hidden` and lets the pointer through, with one exception: the pixel variant’s `game`, which takes pointer events for as long as it is running.',
].join(' ');

const meta = {
  title: 'Layout/AnimatedBackground',
  component: AnimatedBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof AnimatedBackground>;

export default meta;

/** The default sweep across the dot grid, full-bleed with nothing on top of it. */
export const Pixel: StoryFn<AnimatedBackgroundProps> = () => (
  <AnimatedBackground className='h-screen w-screen' />
);

/** A card above the grid, with `excludeCardSize` keeping the dots clear behind it. This story also switches on `game` — the easter egg, and the one case where the backdrop accepts clicks. */
export const PixelWithCard: StoryFn<AnimatedBackgroundProps> = () => (
  <AnimatedBackground
    className='h-screen w-screen'
    game
    excludeCardSize={{ width: 300, height: 200 }}
  >
    <Card className='w-[300px] h-[200px]'>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-text-secondary'>
          Decorative background renders behind interactive content.
        </p>
      </CardContent>
    </Card>
  </AnimatedBackground>
);

/** `variant='blur'`: colour blobs drifting behind a frosted layer, which is the assistant’s backdrop rather than the console’s. */
export const Blur: StoryFn<AnimatedBackgroundProps> = () => (
  <AnimatedBackground variant='blur' className='h-screen w-screen' />
);

/** The same gradient with content over it. There is no exclusion to set here, since the blur has no grid for a card to interrupt. */
export const BlurWithCard: StoryFn<AnimatedBackgroundProps> = () => (
  <AnimatedBackground variant='blur' className='h-screen w-screen'>
    <Card className='w-[300px] h-[200px]'>
      <CardHeader>
        <CardTitle>Wally Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-text-secondary'>
          Liquid gradient background renders behind chat content.
        </p>
      </CardContent>
    </Card>
  </AnimatedBackground>
);
