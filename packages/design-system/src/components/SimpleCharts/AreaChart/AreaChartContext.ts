import { createContext } from 'react';

export type AreaChartVariant = 'stacked' | 'standard';

export const AreaChartVariantContext = createContext<AreaChartVariant>('stacked');
