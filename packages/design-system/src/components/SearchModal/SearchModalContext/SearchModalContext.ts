import { createContext } from 'react';
import type { SearchModalContextValue } from './types';

export const SearchModalContext = createContext<SearchModalContextValue | null>(null);
