import './reactAriaPolyfill';
import { useLayoutEffect } from 'react';

import { BrowserOnly, useDark, usePage } from '@rspress/core/runtime';
import {
  EditLink as OriginalEditLink,
  Layout as OriginalLayout,
  Search as OriginalSearch,
  type RootProps,
} from '@rspress/core/theme-original';
import { DateFormatProvider } from '@wallarm-org/design-system/DateFormatProvider';
import { ThemeProvider, useTheme } from '@wallarm-org/design-system/ThemeProvider';
import { Toaster } from '@wallarm-org/design-system/Toast';

import { NavBrand } from './NavBrand';
import { SearchSectionsHost } from './SearchSections';

export * from '@rspress/core/theme-original';
export { HomeHero } from './HomeHero';

// The home page is the hero alone, one screen tall: HomeHero draws its own background, and there
// are no feature cards or footer message.
export const HomeBackground = () => null;
export const HomeFeature = () => null;
export const HomeFooter = () => null;

// Keeps the DS theme (<html data-theme>) in step with the Rspress appearance toggle.
function ThemeSync() {
  const dark = useDark();
  const { setTheme } = useTheme();
  useLayoutEffect(() => setTheme(dark ? 'dark' : 'light'), [dark, setTheme]);
  return null;
}

// Generated pages (gitignored, see apps/website/.gitignore) have no source file to edit; component
// pages link Source.
const GENERATED = ['/components/', '/foundations/', '/patterns/', '/templates/'];

const isGenerated = (routePath: string): boolean =>
  routePath === '/get-started/changelog' ||
  (GENERATED.some(p => routePath.startsWith(p)) && routePath !== '/foundations/icons');

export function EditLink(props: Parameters<typeof OriginalEditLink>[0]) {
  const { routePath } = usePage().page;
  if (isGenerated(routePath)) return null;
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
  return <OriginalLayout {...props} navTitle={<NavBrand />} />;
}

// Stock Search plus the section shortcuts (see SearchSectionsHost).
export function Search() {
  return (
    <>
      <OriginalSearch />
      <SearchSectionsHost />
    </>
  );
}
