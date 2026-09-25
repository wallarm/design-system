import { createContext } from 'react';
import type { FrameStyle, Theme } from './types';

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  frameStyle: FrameStyle;
  setFrameStyle: (frameStyle: FrameStyle) => void;
}

export const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'light',
  setTheme: () => null,
  frameStyle: 'neutral',
  setFrameStyle: () => null,
});
