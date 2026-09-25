import { useLayoutEffect, useRef, useState } from 'react';
import type { NavStackEntry } from './types';

export const DRILL_ANIMATION_DURATION = '220ms';
export const DRILL_ANIMATION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export interface DrillTransition {
  fromLevel: number;
  direction: 'forward' | 'backward';
  fromNavStack: NavStackEntry[];
  fromActiveItemId: string | null;
}

export const useDrillTransition = (
  drillLevel: number,
  navStack: NavStackEntry[],
  activeItemId: string | null,
) => {
  const previousRef = useRef({ drillLevel, navStack, activeItemId });
  const [transition, setTransition] = useState<DrillTransition | null>(null);

  useLayoutEffect(() => {
    const previous = previousRef.current;
    if (previous.drillLevel !== drillLevel) {
      setTransition({
        fromLevel: previous.drillLevel,
        direction: drillLevel > previous.drillLevel ? 'forward' : 'backward',
        fromNavStack: previous.navStack,
        fromActiveItemId: previous.activeItemId,
      });
    }
    previousRef.current = { drillLevel, navStack, activeItemId };
  }, [activeItemId, drillLevel, navStack]);

  const clearTransition = () => setTransition(null);

  return { transition, clearTransition };
};
