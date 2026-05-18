import { type FC, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { matchNav } from './matchNav';
import { findFirstLinkPath } from './navUtils';
import { ProductNavContextProvider } from './ProductNavContext';
import type { NavConfig, NavConfigDrill } from './types';
import { pushPathname, useLocationPathname } from './useLocationPathname';

export interface ProductNavProps {
  config: NavConfig;
  /** URL prefix stripped before matching and prepended when navigating.
   *  Example: `"/edge"` turns URL `/edge/overview` into effective pathname `/overview`. */
  basePath?: string;
  /** Custom navigation handler for router integration (React Router, Next.js, etc.).
   *  Default: uses history.pushState to update the URL directly. */
  onNavigate?: (pathname: string) => void;
  children: ReactNode;
}

export const ProductNav: FC<ProductNavProps> = ({ config, basePath, onNavigate, children }) => {
  const fullPathname = useLocationPathname();

  // Strip basePath prefix so matchNav sees product-relative paths
  const pathname =
    basePath && fullPathname.startsWith(basePath)
      ? fullPathname.slice(basePath.length) || '/'
      : fullPathname;

  const setPathname = useCallback(
    (next: string) => {
      const fullPath = basePath ? `${basePath}${next}` : next;
      if (onNavigate) {
        onNavigate(fullPath);
      } else {
        pushPathname(fullPath);
      }
    },
    [basePath, onNavigate],
  );

  // nav state
  const { navStack, breadcrumbSegments, activeItemId } = useMemo(
    () => matchNav(pathname, config),
    [pathname, config],
  );

  const urlDrillLevel = navStack.length - 1;

  // Visual drill level override — allows the menu to display a different
  // level than what the URL implies (e.g. after clicking "back").
  const [visualDrillLevel, setVisualDrillLevel] = useState<number | null>(null);

  // Reset visual override whenever the URL actually changes
  useEffect(() => {
    setVisualDrillLevel(null);
  }, [pathname]);

  // Effective values accounting for visual override
  const effectiveDrillLevel = visualDrillLevel ?? urlDrillLevel;
  const effectiveActiveItemId =
    effectiveDrillLevel < urlDrillLevel
      ? (navStack[effectiveDrillLevel]?.activeItemId ?? activeItemId)
      : activeItemId;

  // handlers
  const navigate = useCallback(
    (path: string) => {
      setVisualDrillLevel(null);
      const segments = pathname
        .replace(/^\/+|\/+$/g, '')
        .split('/')
        .filter(Boolean);
      const prefixSegments = segments.slice(0, effectiveDrillLevel * 2);
      setPathname(`/${[...prefixSegments, path].join('/')}`);
    },
    [effectiveDrillLevel, pathname, setPathname],
  );

  const drillInto = useCallback(
    (drill: NavConfigDrill) => {
      setVisualDrillLevel(null);
      const defaultEntity = drill.entities?.[0]?.id ?? 'default';
      const firstChildPath = findFirstLinkPath(drill.children) ?? '';
      setPathname(`/${drill.path}/${defaultEntity}/${firstChildPath}`);
    },
    [setPathname],
  );

  const goBack = useCallback(() => {
    setVisualDrillLevel(prev => {
      const current = prev ?? urlDrillLevel;
      return Math.max(current - 1, 0);
    });
  }, [urlDrillLevel]);

  const navigateTo = useCallback(
    (href: string) => {
      setVisualDrillLevel(null);
      if (href === '/') {
        const firstPath = findFirstLinkPath(config.items) ?? '';
        setPathname(`/${firstPath}`);
      } else {
        setPathname(href);
      }
    },
    [config.items, setPathname],
  );

  // context
  const navCtxValue = useMemo(
    () => ({
      config,
      pathname,
      navStack,
      breadcrumbSegments,
      activeItemId,
      drillLevel: effectiveDrillLevel,
      effectiveActiveItemId,
      navigate,
      drillInto,
      goBack,
      navigateTo,
    }),
    [
      config,
      pathname,
      navStack,
      breadcrumbSegments,
      activeItemId,
      effectiveDrillLevel,
      effectiveActiveItemId,
      navigate,
      drillInto,
      goBack,
      navigateTo,
    ],
  );

  return <ProductNavContextProvider value={navCtxValue}>{children}</ProductNavContextProvider>;
};
