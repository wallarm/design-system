import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
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
