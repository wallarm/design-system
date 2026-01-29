import { createContext } from 'react';

import type { DrawerContextValue } from './types';

export const DrawerContext = createContext<DrawerContextValue | null>(null);
