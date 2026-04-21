import { createContext } from 'react';

export interface BarListContextValue {
  max: number;
  isValidMax: boolean;
}

export interface BarListItemContextValue {
  /** `value / max`, clamped to [0, 1]. Drives both the bar width and the percent label. */
  ratio: number;
  selected: boolean;
  interactive: boolean;
}

export const BarListContext = createContext<BarListContextValue | null>(null);

export const BarListItemContext = createContext<BarListItemContextValue | null>(null);
