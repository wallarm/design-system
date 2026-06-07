import type { MutableRefObject, RefObject } from 'react';
import { useEffect } from 'react';
import type { SweepEngine } from './index';

export const useGameKeyboard = (
  engineRef: RefObject<SweepEngine | null>,
  game: boolean,
  armed: boolean,
  roundOver: boolean,
  hasStartedRoundRef: MutableRefObject<boolean>,
): void => {
  // full controls — armed mode, round in progress
  useEffect(() => {
    if (!game || !armed || roundOver) return;

    const held = { left: false, right: false };

    function updateDir() {
      const dir = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      engineRef.current?.setCannonDir(dir);
    }

    function onKeyDown(e: KeyboardEvent) {
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
      } else if (e.key === 'Escape') {
        e.preventDefault();
        engineRef.current?.exitGame();
        hasStartedRoundRef.current = false;
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
  }, [game, armed, roundOver, engineRef, hasStartedRoundRef]);

  // esc during results screen
  useEffect(() => {
    if (!game || !roundOver) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        engineRef.current?.exitGame();
        hasStartedRoundRef.current = false;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game, roundOver, engineRef, hasStartedRoundRef]);
};
