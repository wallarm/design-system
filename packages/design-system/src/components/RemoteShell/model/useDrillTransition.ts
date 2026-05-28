import { useLayoutEffect, useRef, useState } from 'react';

export const DRILL_ANIMATION_DURATION = '220ms';
export const DRILL_ANIMATION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export interface DrillTransition {
  fromLevel: number;
  direction: 'forward' | 'backward';
}

export const useDrillTransition = (drillLevel: number) => {
  const prevLevelRef = useRef(drillLevel);
  const [transition, setTransition] = useState<DrillTransition | null>(null);

  useLayoutEffect(() => {
    const prev = prevLevelRef.current;
    if (prev !== drillLevel) {
      setTransition({
        fromLevel: prev,
        direction: drillLevel > prev ? 'forward' : 'backward',
      });
      prevLevelRef.current = drillLevel;
    }
  }, [drillLevel]);

  const clearTransition = () => setTransition(null);

  return { transition, clearTransition };
};
