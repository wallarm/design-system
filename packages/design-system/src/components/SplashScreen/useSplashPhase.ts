import type { TransitionEvent } from 'react';
import { useEffect, useState } from 'react';
import type { PhaseType, SplashScreenShrinkTarget } from './types';

const doubleRaf = (callback: () => void): (() => void) => {
  let id2: number;
  const id1 = requestAnimationFrame(() => {
    id2 = requestAnimationFrame(callback);
  });
  return () => {
    cancelAnimationFrame(id1);
    cancelAnimationFrame(id2);
  };
};

export const useSplashPhase = (visible: boolean, shrinkTarget?: SplashScreenShrinkTarget) => {
  const [phase, setPhase] = useState<PhaseType>(() => {
    if (visible) return 'enter-start';
    if (shrinkTarget) return 'settled';
    return 'exited';
  });

  const [childrenRevealed, setChildrenRevealed] = useState(!visible && !!shrinkTarget);

  useEffect(() => {
    if (visible) {
      setPhase('enter-start');
      setChildrenRevealed(false);
      return doubleRaf(() => setPhase('entered'));
    }

    setPhase(prev => {
      if (prev === 'exited' || prev === 'enter-start') {
        return shrinkTarget ? 'settled' : 'exited';
      }
      return shrinkTarget ? 'content-fading' : 'exiting';
    });
  }, [visible, shrinkTarget]);

  useEffect(() => {
    if (phase !== 'settled') return;
    return doubleRaf(() => setChildrenRevealed(true));
  }, [phase]);

  const handleContainerTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (phase === 'shrinking' && e.propertyName === 'clip-path') {
      setPhase('settled');
    }
  };

  const handleContentTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (phase === 'exiting') {
      setPhase('exited');
    } else if (phase === 'content-fading') {
      setPhase('shrinking');
    }
  };

  return {
    phase,
    childrenRevealed,
    handleContainerTransitionEnd,
    handleContentTransitionEnd,
  };
};
