import './reactAriaPolyfill';

import { useLayoutEffect } from 'react';
import { BrowserOnly, useDark } from '@rspress/core/runtime';
import type { RootProps } from '@rspress/core/theme';
import { DateFormatProvider } from '@wallarm-org/design-system/DateFormatProvider';
import { ThemeProvider, useTheme } from '@wallarm-org/design-system/ThemeProvider';
import { Toaster } from '@wallarm-org/design-system/Toast';

export * from '@rspress/core/theme-original';

// Keeps the DS theme (<html data-theme>) in step with the Rspress appearance toggle.
function ThemeSync() {
  const dark = useDark();
  const { setTheme } = useTheme();
  useLayoutEffect(() => setTheme(dark ? 'dark' : 'light'), [dark, setTheme]);
  return null;
}

export function Root({ children }: RootProps) {
  return (
    <ThemeProvider>
      <ThemeSync />
      <DateFormatProvider order='day-first'>{children}</DateFormatProvider>
      <BrowserOnly fallback={null}>{() => <Toaster />}</BrowserOnly>
    </ThemeProvider>
  );
}
