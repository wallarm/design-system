import { createContext } from 'react';

import type { Theme } from './types';

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'system',
  setTheme: () => null,
});
