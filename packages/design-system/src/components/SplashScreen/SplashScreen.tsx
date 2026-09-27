import type { FC } from 'react';
import { useRef } from 'react';
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
import { useContentHeight } from './useContentHeight';
import { useSplashPhase } from './useSplashPhase';

export const SplashScreen: FC<SplashScreenProps> = ({
  ref,
  visible = true,
  shrinkTarget,
  className,
  children,
  onPhaseChange,
  ...props
}) => {
  const { phase, childrenRevealed, handleContainerTransitionEnd, handleContentTransitionEnd } =
    useSplashPhase(visible, shrinkTarget, onPhaseChange);

  // Measure content height for shrink animation (only when height is not provided)
  const contentRef = useRef<HTMLDivElement>(null);
  const isLocked = phase !== 'settled'; // Lock measurement during animation
  const shouldMeasure = Boolean(children && shrinkTarget && shrinkTarget.height === undefined);
  const measuredHeight = useContentHeight(contentRef, shouldMeasure, isLocked);

  if (phase === 'exited') return null;

  const containerPhase = phase as Exclude<PhaseType, 'exited'>;
  const contentPhase = phase as ContentPhase;

  // Keep content mounted during 'shrinking' so the DOM child removal doesn't
  // interfere with the clip-path CSS transition on the container.
  const showContent = SPLASH_PHASES[contentPhase] || phase === 'shrinking';
  const effectiveContentPhase: ContentPhase =
    phase === 'shrinking' ? 'content-fading' : contentPhase;

  // Determine if children wrapper should be visible
  const shouldShowChildren = children && shrinkTarget;
  const isChildrenVisible = phase === 'shrinking' || phase === 'settled';

  return (
    <div
      {...props}
      data-slot='splash-screen'
      ref={ref}
      className={cn(splashContainerVariants({ phase: containerPhase }), className)}
      style={getContainerStyle(phase, shrinkTarget, measuredHeight)}
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

      {shouldShowChildren && (
        <div
          ref={contentRef}
          className={cn(
            'absolute h-auto w-full transition-opacity duration-300',
            // Hidden (for measurement) until shrinking phase starts
            !isChildrenVisible && 'invisible pointer-events-none opacity-0',
            // During shrinking: visible but not interactive, opacity fades in
            phase === 'shrinking' && 'visible pointer-events-none',
            phase === 'shrinking' && (childrenRevealed ? 'opacity-100' : 'opacity-0'),
            // In settled: fully visible and interactive, height transitions enabled
            phase === 'settled' && 'visible pointer-events-auto opacity-100',
            phase === 'settled' && 'transition-[height,opacity] duration-200',
          )}
          style={shrinkTarget ? { width: shrinkTarget.width } : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
};

SplashScreen.displayName = 'SplashScreen';
