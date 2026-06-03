import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { Logo } from '../Logo';
import { Progress } from '../Progress';
import {
  splashContainerVariants,
  splashContentVariants,
  splashLogoVariants,
  splashProgressVariants,
} from './classes';
import { getContainerStyle, SPLASH_PHASES } from './lib';
import type { ContentPhase, PhaseType, SplashScreenProps } from './types';
import { useSplashPhase } from './useSplashPhase';

export const SplashScreen: FC<SplashScreenProps> = ({
  ref,
  visible = true,
  shrinkTarget,
  className,
  children,
  ...props
}) => {
  const { phase, childrenRevealed, handleContainerTransitionEnd, handleContentTransitionEnd } =
    useSplashPhase(visible, shrinkTarget);

  if (phase === 'exited') return null;

  const containerPhase = phase as Exclude<PhaseType, 'exited'>;
  const contentPhase = phase as ContentPhase;

  return (
    <div
      {...props}
      data-slot='splash-screen'
      ref={ref}
      className={cn(splashContainerVariants({ phase: containerPhase }), className)}
      style={getContainerStyle(phase, shrinkTarget)}
      onTransitionEnd={handleContainerTransitionEnd}
    >
      {SPLASH_PHASES[contentPhase] && (
        <div
          className={splashContentVariants({ phase: contentPhase })}
          onTransitionEnd={handleContentTransitionEnd}
        >
          <Logo className={splashLogoVariants({ phase: contentPhase })} />
          <Progress value={null} className={splashProgressVariants({ phase: contentPhase })} />
        </div>
      )}

      {phase === 'settled' && children && (
        <div
          className={cn(
            'h-full w-full transition-opacity duration-300',
            childrenRevealed ? 'opacity-100' : 'opacity-0',
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

SplashScreen.displayName = 'SplashScreen';
