import type { FC, HTMLAttributes, Ref } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { Logo } from '../Logo';
import { Progress } from '../Progress';

type Phase = 'enter-start' | 'entered' | 'exiting' | 'exited';

export interface SplashScreenProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  visible?: boolean;
}

export const SplashScreen: FC<SplashScreenProps> = ({
  ref,
  visible = true,
  className,
  ...props
}) => {
  const [phase, setPhase] = useState<Phase>(visible ? 'enter-start' : 'exited');

  useEffect(() => {
    if (visible) {
      setPhase('enter-start');

      let inner: number;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => {
          setPhase('entered');
        });
      });

      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    setPhase(prev => (prev === 'exited' || prev === 'enter-start' ? 'exited' : 'exiting'));
  }, [visible]);

  if (phase === 'exited') return null;

  return (
    <div
      {...props}
      data-slot='splash-screen'
      ref={ref}
      className='h-full w-full flex items-center justify-center'
    >
      <div
        className={cn(
          'flex h-max w-max flex-col items-center justify-center gap-12',
          phase === 'enter-start' && 'opacity-0 translate-y-12',
          phase === 'entered' && 'opacity-100 translate-y-0 transition-all duration-500 ease-out',
          phase === 'exiting' && 'opacity-0 transition-opacity duration-300 ease-out',
          className,
        )}
        onTransitionEnd={() => {
          if (phase === 'exiting') {
            setPhase('exited');
          }
        }}
      >
        <Logo />
        <Progress value={null} size='sm' />
      </div>
    </div>
  );
};

SplashScreen.displayName = 'SplashScreen';
