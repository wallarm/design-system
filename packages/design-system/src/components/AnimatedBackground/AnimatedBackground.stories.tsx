import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { AnimatedBackground } from './AnimatedBackground';
import type { AnimatedBackgroundProps } from './module';

const meta = {
  title: 'Layout/AnimatedBackground',
  component: AnimatedBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Decorative animated auth background. Renders a "detection sweep" ' +
          'animation — a scan line crosses a dot grid, dots bloom as it passes, ' +
          'and occasional anomaly events flash in accent color. Two texture modes: ' +
          '`halftone` (variable-sized squares) and `clean` (small dots with bloom). ' +
          'Purely decorative (`aria-hidden`), never intercepts pointer events. ' +
          'Content passed as `children` is centered above the canvas.',
      },
    },
  },
} satisfies Meta<typeof AnimatedBackground>;

export default meta;

export const Halftone: StoryFn<AnimatedBackgroundProps> = () => (
  <AnimatedBackground className='h-[500px] w-full' />
);

export const WithCard: StoryFn<AnimatedBackgroundProps> = () => (
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
