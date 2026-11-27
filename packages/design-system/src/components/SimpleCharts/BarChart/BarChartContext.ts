import { createContext } from 'react';

/**
 * Where the row total sits: `'end'` — a column on the right edge, `'start'` — between the
 * label and the bar, `false` — no total.
 */
export type BarChartTotalPlacement = 'end' | 'start' | false;

export const BarChartTotalContext = createContext<BarChartTotalPlacement>('end');
