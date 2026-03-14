import { createContext } from 'react';
import type { FilterInputContextValue } from './types';

export const FilterInputContext = createContext<FilterInputContextValue | null>(null);
