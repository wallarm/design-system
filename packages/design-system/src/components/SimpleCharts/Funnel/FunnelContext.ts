import { createContext } from 'react';

export interface FunnelContextValue {
  /** Position of the step, left to right, from 0. */
  index: number;
}

export const FunnelContext = createContext<FunnelContextValue>({ index: 0 });
