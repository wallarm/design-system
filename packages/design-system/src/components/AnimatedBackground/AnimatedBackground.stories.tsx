import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { AnimatedBackground, type AnimatedBackgroundProps } from './AnimatedBackground';

const meta = {
  title: 'Layout/AnimatedBackground',
  component: AnimatedBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Decorative animated background with two variants. ' +
          '`pixel` (default): canvas-based dot grid with sweep animation. ' +
          '`blur`: liquid mesh gradient with six drifting color blobs. ' +
          'Purely decorative (`aria-hidden`), never intercepts pointer events. ' +
          'Content passed as `children` is centered above the background.',
      },
    },
  },
} satisfies Meta<typeof AnimatedBackground>;

export default meta;

export const Pixel: StoryFn<AnimatedBackgroundProps> = () => (
  <AnimatedBackground className='h-screen w-screen' />
);

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

export const Blur: StoryFn<AnimatedBackgroundProps> = () => (
  <AnimatedBackground variant='blur' className='h-screen w-screen' />
);

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
