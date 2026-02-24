import { createContext } from 'react';
import type { TableContextValue } from './types';

export const TableContext = createContext<TableContextValue<any> | null>(null);
