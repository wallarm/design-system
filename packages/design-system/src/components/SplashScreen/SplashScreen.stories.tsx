import { useEffect, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { AnimatedBackground } from '../AnimatedBackground';
import { Button } from '../Button';
import { VStack } from '../Stack';
import { SplashScreen } from './SplashScreen';

const meta = {
  title: 'Loading/SplashScreen',
  component: SplashScreen,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SplashScreen>;

export default meta;

export const Basic: StoryFn = () => <SplashScreen />;

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
