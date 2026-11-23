import { createContext } from 'react';

export interface FunnelContextValue {
  /** Position of the step, left to right, from 0. */
  index: number;
  /** Number of steps in the funnel. */
  count: number;
}

export const FunnelContext = createContext<FunnelContextValue>({ index: 0, count: 0 });
