import type { MutableRefObject, RefObject } from 'react';
import { useCallback, useEffect } from 'react';
import type { SweepEngine } from './index';

export const useGameKeyboard = (
  engineRef: RefObject<SweepEngine | null>,
  game: boolean,
  armed: boolean,
  roundOver: boolean,
  hasStartedRoundRef: MutableRefObject<boolean>,
  toggleSound: () => void,
): void => {
  // shared handler for Escape + M — active in both armed and round-over states
  const handleCommonKey = useCallback(
    (e: KeyboardEvent): boolean => {
      if (e.key === 'Escape') {
        e.preventDefault();
        engineRef.current?.exitGame();
        hasStartedRoundRef.current = false;
        return true;
      }
      if (e.key === 'm' || e.key === 'M') {
        toggleSound();
        return true;
      }
      return false;
    },
    [engineRef, hasStartedRoundRef, toggleSound],
  );

  // full controls — armed mode, round in progress
  useEffect(() => {
    if (!game || !armed || roundOver) return;

    const held = { left: false, right: false };

    function updateDir() {
      const dir = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      engineRef.current?.setCannonDir(dir);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (handleCommonKey(e)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        held.left = true;
        updateDir();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        held.right = true;
        updateDir();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!e.repeat) {
          engineRef.current?.setFiring(true);
        }
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        held.left = false;
        updateDir();
      } else if (e.key === 'ArrowRight') {
        held.right = false;
        updateDir();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        engineRef.current?.setFiring(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      engineRef.current?.setFiring(false);
      engineRef.current?.setCannonDir(0);
    };
  }, [game, armed, roundOver, engineRef, handleCommonKey]);

  // esc + sound toggle during idle phase (before arming)
  useEffect(() => {
    if (!game || armed) return;

    function onKeyDown(e: KeyboardEvent) {
      handleCommonKey(e);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game, armed, handleCommonKey]);

  // esc + sound toggle during results screen
  useEffect(() => {
    if (!game || !roundOver) return;

    function onKeyDown(e: KeyboardEvent) {
      handleCommonKey(e);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game, roundOver, handleCommonKey]);
};
