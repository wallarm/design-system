import { createContext } from 'react';
import type { FilterContextValue } from './types';

export const FilterContext = createContext<FilterContextValue | null>(null);
