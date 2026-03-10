import { createContext } from 'react';
import type { QueryBarContextValue } from './types';

export const QueryBarContext = createContext<QueryBarContextValue | null>(null);
