import { useEffect, useRef } from 'react';

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
