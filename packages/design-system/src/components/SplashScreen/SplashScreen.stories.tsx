import { useEffect, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { AnimatedBackground } from '../AnimatedBackground';
import { Button } from '../Button';
import { VStack } from '../Stack';
import { SplashScreen } from './SplashScreen';

const DESCRIPTION = [
  'The full-screen entrance for a cold start — the brand `Logo` over an indeterminate bar, shown once while the app boots.',
  'Never on a route change and never as a general loading veil: in-app waits belong to `Loader`, `Skeleton` or `Progress`, and `AppShell` ships its own first-load reveal, so run one or the other rather than both.',
  'You drive `visible` and nothing else — the phases between are internal — and since it enforces no minimum on-screen time, guarding against a flash on a fast boot is the caller’s job.',
].join(' ');

const meta = {
  title: 'Loading/SplashScreen',
  component: SplashScreen,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof SplashScreen>;

export default meta;

/** The splash as it looks while the app boots. `visible` defaults to `true`, so this is the state you mount it in. */
export const Basic: StoryFn = () => <SplashScreen />;

/** Flipping `visible` to false is the whole handover: with no `shrinkTarget` the splash fades out and unmounts, and any children are never shown. */
export const Toggle: StoryFn = () => {
  const [visible, setVisible] = useState(true);

  return (
    <VStack align='center'>
      <div className='flex h-400 w-400 items-center justify-center'>
        <SplashScreen visible={visible} />
      </div>

      <Button type='button' onClick={() => setVisible(v => !v)}>
        {visible ? 'Hide' : 'Show'}
      </Button>
    </VStack>
  );
};

/** With a `shrinkTarget` it morphs into that box and reveals its children inside — the entrance becomes the first view, typically a sign-in card. */
export const ShrinkToCard: StoryFn = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <div className='relative h-screen w-screen'>
      <AnimatedBackground />

      <div className='absolute inset-0 flex items-center justify-center'>
        <SplashScreen
          visible={visible}
          shrinkTarget={{ width: 480, height: 600, borderRadius: 12 }}
          className='bg-bg-page-bg shadow-lg'
        >
          <div className='flex h-full flex-col items-center justify-center gap-4 p-8'>
            <h2 className='text-lg font-semibold text-text-primary'>Welcome</h2>
            <p className='text-center text-sm text-text-secondary'>
              Content revealed after splash animation.
            </p>
            <Button type='button' onClick={() => setVisible(true)}>
              Replay
            </Button>
          </div>
        </SplashScreen>
      </div>
    </div>
  );
};

ShrinkToCard.parameters = {
  layout: 'fullscreen',
};
