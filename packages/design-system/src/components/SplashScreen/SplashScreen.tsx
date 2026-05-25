import type { FC, HTMLAttributes, Ref } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { Logo } from '../Logo';
import { Progress } from '../Progress';
import { splashContentVariants, splashLogoVariants, splashProgressVariants } from './classes';

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

  const animPhase = phase as Exclude<Phase, 'exited'>;

  return (
    <div
      {...props}
      data-slot='splash-screen'
      ref={ref}
      className='h-full w-full flex items-center justify-center'
    >
      <div
        className={cn(splashContentVariants({ phase: animPhase }), className)}
        onTransitionEnd={() => {
          if (phase === 'exiting') {
            setPhase('exited');
          }
        }}
      >
        <Logo className={splashLogoVariants({ phase: animPhase })} />
        <Progress value={null} className={splashProgressVariants({ phase: animPhase })} />
      </div>
    </div>
  );
};

SplashScreen.displayName = 'SplashScreen';
