import type { TransitionEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
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
  const shrinkTargetRef = useRef(shrinkTarget);
  shrinkTargetRef.current = shrinkTarget;

  const [phase, setPhase] = useState<PhaseType>(() =>
    visible ? 'enter-start' : shrinkTarget ? 'settled' : 'exited',
  );

  const [childrenRevealed, setChildrenRevealed] = useState(!visible && !!shrinkTarget);
  const contentShownRef = useRef(false);

  useEffect(() => {
    if (visible) {
      contentShownRef.current = false;
      setPhase('enter-start');
      setChildrenRevealed(false);
      return doubleRaf(() => {
        contentShownRef.current = true;
        setPhase('entered');
      });
    }

    setPhase(prev => {
      if (prev === 'exited') {
        return shrinkTargetRef.current ? 'settled' : 'exited';
      }
      if (prev === 'enter-start' && !shrinkTargetRef.current) {
        return 'exited';
      }
      return shrinkTargetRef.current ? 'content-fading' : 'exiting';
    });
  }, [visible]);

  useEffect(() => {
    if (phase === 'content-fading' && !contentShownRef.current) {
      // Content was never visible (opacity stayed at 0) so transitionend won't
      // fire. Advance to 'shrinking' after the browser paints the initial
      // clip-path: inset(0 0 round 0px) set by 'content-fading'.
      return doubleRaf(() => setPhase('shrinking'));
    }
    if (phase === 'settled') {
      return doubleRaf(() => setChildrenRevealed(true));
    }
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
