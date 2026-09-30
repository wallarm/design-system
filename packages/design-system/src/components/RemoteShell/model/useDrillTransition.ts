import { useLayoutEffect, useRef, useState } from 'react';
import type { NavStackEntry } from './types';

export const DRILL_ANIMATION_DURATION = '220ms';
export const DRILL_ANIMATION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export interface DrillTransition {
  fromLevel: number;
  direction: 'forward' | 'backward';
  fromNavStack: NavStackEntry[];
}

interface ScopedDrillTransition extends DrillTransition {
  scope: string;
}

/**
 * Tracks drill-level changes and exposes the transition to animate.
 *
 * `scope` identifies the nav tree (the config's `productPath`). A level change that
 * coincides with a scope change — the same `RemoteShell` instance re-rendered for a
 * different product — is not animated: sliding from the previous product's menu would
 * show the wrong items. Keyed on `productPath` rather than config identity so a config
 * rebuilt for the same product (e.g. when scope-switcher entities load) still animates.
 */
export const useDrillTransition = (
  drillLevel: number,
  navStack: NavStackEntry[],
  scope: string,
) => {
  const previousRef = useRef({ drillLevel, navStack, scope });
  const [transition, setTransition] = useState<ScopedDrillTransition | null>(null);

  useLayoutEffect(() => {
    const previous = previousRef.current;
    if (previous.scope !== scope) {
      setTransition(null);
    } else if (previous.drillLevel !== drillLevel) {
      setTransition({
        fromLevel: previous.drillLevel,
        direction: drillLevel > previous.drillLevel ? 'forward' : 'backward',
        fromNavStack: previous.navStack,
        scope,
      });
    }
    previousRef.current = { drillLevel, navStack, scope };
  }, [drillLevel, navStack, scope]);

  const clearTransition = () => setTransition(null);

  // A transition captured for another scope is dropped in the very render the scope
  // changes, before the layout effect above clears it.
  const activeTransition: DrillTransition | null =
    transition && transition.scope === scope ? transition : null;

  return { transition: activeTransition, clearTransition };
};
