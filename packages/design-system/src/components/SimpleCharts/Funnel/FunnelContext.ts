import { createContext } from 'react';
export interface FunnelContextValue {
  /** Body thickness of every step, in order. */
  thicknesses: readonly number[];
  /** Fill classes of every step, in order. */
  fills: readonly string[];
}

export const FunnelContext = createContext<FunnelContextValue | null>(null);

/** Position of a step among its siblings. Set by `Funnel` around each child. */
export const FunnelStepIndexContext = createContext<number>(0);
