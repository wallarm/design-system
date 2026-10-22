import './reactAriaPolyfill';

import { useLayoutEffect } from 'react';
import { BrowserOnly, useDark, usePage } from '@rspress/core/runtime';
import {
  EditLink as OriginalEditLink,
  Layout as OriginalLayout,
  type RootProps,
} from '@rspress/core/theme-original';
import { DateFormatProvider } from '@wallarm-org/design-system/DateFormatProvider';
import { ThemeProvider, useTheme } from '@wallarm-org/design-system/ThemeProvider';
import { Toaster } from '@wallarm-org/design-system/Toast';
import { NavBrand } from './NavBrand';

export * from '@rspress/core/theme-original';

// Keeps the DS theme (<html data-theme>) in step with the Rspress appearance toggle.
function ThemeSync() {
  const dark = useDark();
  const { setTheme } = useTheme();
  useLayoutEffect(() => setTheme(dark ? 'dark' : 'light'), [dark, setTheme]);
  return null;
}

// Generated pages have no source file under apps/docs/docs to edit; component pages link Source.
const GENERATED = ['/foundations/tokens', '/get-started/changelog'];

export function EditLink(props: Parameters<typeof OriginalEditLink>[0]) {
  const { routePath } = usePage().page;
  if (routePath.startsWith('/components/') || GENERATED.includes(routePath)) return null;
  return <OriginalEditLink {...props} />;
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

export function Layout(props: Parameters<typeof OriginalLayout>[0]) {
  return (
    <OriginalLayout {...props} navTitle={<NavBrand />} beforeHero={<NavBrand size='hero' />} />
  );
}
