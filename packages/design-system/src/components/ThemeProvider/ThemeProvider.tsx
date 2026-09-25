import { type FC, type ReactNode, useEffect, useMemo, useState } from 'react';
import { ThemeProviderContext } from './ThemeProviderContext';
import type { FrameStyle, Theme } from './types';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  /** Frame style used until the user picks one. */
  defaultFrameStyle?: FrameStyle;
  frameStyleStorageKey?: string;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'wasd-theme',
  defaultFrameStyle = 'neutral',
  frameStyleStorageKey = 'wasd-frame-style',
  ...props
}) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );
  const [frameStyle, setFrameStyle] = useState<FrameStyle>(() => {
    const stored = localStorage.getItem(frameStyleStorageKey);
    return stored === 'neutral' || stored === 'branded' ? stored : defaultFrameStyle;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.setAttribute('data-theme', theme);
  }, [theme]);

  // On <html> like the theme, so every micro-frontend in the document picks the style up.
  useEffect(() => {
    window.document.documentElement.setAttribute('data-frame-style', frameStyle);
  }, [frameStyle]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (theme: Theme) => {
        localStorage.setItem(storageKey, theme);
        setTheme(theme);
      },
      frameStyle,
      setFrameStyle: (frameStyle: FrameStyle) => {
        localStorage.setItem(frameStyleStorageKey, frameStyle);
        setFrameStyle(frameStyle);
      },
    }),
    [theme, storageKey, frameStyle, frameStyleStorageKey],
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';
