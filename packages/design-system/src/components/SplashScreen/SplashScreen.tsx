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

  // Keep content mounted during 'shrinking' so the DOM child removal doesn't
  // interfere with the clip-path CSS transition on the container.
  const showContent = SPLASH_PHASES[contentPhase] || phase === 'shrinking';
  const effectiveContentPhase: ContentPhase =
    phase === 'shrinking' ? 'content-fading' : contentPhase;

  return (
    <div
      {...props}
      data-slot='splash-screen'
      ref={ref}
      className={cn(splashContainerVariants({ phase: containerPhase }), className)}
      style={getContainerStyle(phase, shrinkTarget)}
      onTransitionEnd={handleContainerTransitionEnd}
    >
      {showContent && (
        <div
          className={splashContentVariants({ phase: effectiveContentPhase })}
          onTransitionEnd={handleContentTransitionEnd}
        >
          <Logo className={splashLogoVariants({ phase: effectiveContentPhase })} />
          <Progress
            value={null}
            className={splashProgressVariants({ phase: effectiveContentPhase })}
          />
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
