import { createContext } from 'react';
import type { DateRangeContextValue } from './types';

export const DateRangeContext = createContext<DateRangeContextValue | undefined>(undefined);
