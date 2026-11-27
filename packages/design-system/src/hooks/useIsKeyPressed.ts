import { useEffect, useRef } from 'react';

/**
 * Tracks whether `targetKey` (a `KeyboardEvent.key`) is held down, via
 * window `keydown`/`keyup`. Returns a ref, so reading it never re-renders —
 * read `.current` in event handlers, not during render.
 *
 * @example
 * const shiftPressed = useIsKeyPressed('Shift');
 * const handleClick = () => (shiftPressed.current ? selectRange() : selectOne());
 */
export const useIsKeyPressed = (targetKey: string): React.RefObject<boolean> => {
  const ref = useRef(false);

  useEffect(() => {
    const downHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) ref.current = true;
    };
    const upHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) ref.current = false;
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return ref;
};
