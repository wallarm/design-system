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
          'Decorative animated auth background. Renders a "detection sweep" ' +
          'animation — a scan line crosses a dot grid, dots bloom as it passes, ' +
          'and occasional anomaly events flash in accent color. Two texture modes: ' +
          '`halftone` (variable-sized squares) and `clean` (small dots with bloom). ' +
          'Purely decorative (`aria-hidden`), never intercepts pointer events.',
      },
    },
  },
} satisfies Meta<typeof AnimatedBackground>;

export default meta;

export const Halftone: StoryFn<AnimatedBackgroundProps> = () => (
  <div className='h-[500px] w-full'>
    <AnimatedBackground />
  </div>
);

export const WithCard: StoryFn<AnimatedBackgroundProps> = () => (
  <div className='relative h-full w-full'>
    <AnimatedBackground />

    <Card className='absolute top-1/2 left-1/2 -translate-1/2 w-[300px] h-max'>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-text-secondary'>
          Decorative background renders behind interactive content.
        </p>
      </CardContent>
    </Card>
  </div>
);
