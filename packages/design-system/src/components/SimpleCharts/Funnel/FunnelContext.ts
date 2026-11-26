import { createContext } from 'react';

export interface FunnelStepContextValue {
  /** Position of this step, left to right. Drives the entrance stagger. */
  index: number;
  /** The highlighted step — hovered, else focused; `null` when none. */
  activeIndex: number | null;
  onHover: (index: number) => void;
  onFocus: (index: number | null) => void;
}

/** Set by `Funnel` around each `FunnelStep`; `null` when a step renders on its own. */
export const FunnelStepContext = createContext<FunnelStepContextValue | null>(null);

export interface FunnelRibbonContextValue {
  thicknesses: readonly number[];
  fills: readonly string[];
  activeIndex: number | null;
}

/**
 * Feeds the ribbon segments past recharts. Recharts remounts every bar shape when its rectangle
 * data changes identity, which would replay the entrance and skip the dimming transition — so the
 * chart's own props stay stable and everything that changes reaches the segments through here.
 */
export const FunnelRibbonContext = createContext<FunnelRibbonContextValue>({
  thicknesses: [],
  fills: [],
  activeIndex: null,
});
