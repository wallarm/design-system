import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import type { NavConfig, NavConfigDrill } from './model';
import {
  findFirstLinkPath,
  matchNav,
  pushPathname,
  RemoteShellContextProvider,
  useLocationPathname,
} from './model';

export interface RemoteShellProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  /** Navigation config used to build nav state for sub-components. */
  config: NavConfig;
  /** URL prefix stripped before matching and prepended when navigating (e.g. `"/edge"`). */
  basePath?: string;
  /** Custom navigation handler for router integration (React Router, Next.js, etc.). */
  onNavigate?: (pathname: string) => void;
}

export const RemoteShell: FC<RemoteShellProps> = ({
  ref,
  className,
  children,
  config,
  basePath,
  onNavigate,
  'data-testid': testId,
  ...props
}) => {
  const fullPathname = useLocationPathname();

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
      const segments = pathname
        .replace(/^\/+|\/+$/g, '')
        .split('/')
        .filter(Boolean);
      const prefixSegments = segments.slice(0, effectiveDrillLevel * 2);
      const defaultEntity = drill.entities?.[0]?.id ?? 'default';
      const firstChildPath = findFirstLinkPath(drill.children) ?? '';
      setPathname(`/${[...prefixSegments, drill.path, defaultEntity, firstChildPath].join('/')}`);
    },
    [effectiveDrillLevel, pathname, setPathname],
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
      if (href === config.productPath) {
        setPathname('/');
      } else {
        setPathname(href);
      }
    },
    [config.productPath, setPathname],
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

  return (
    <RemoteShellContextProvider value={navCtxValue}>
      <TestIdProvider value={testId}>
        <div
          {...props}
          ref={ref}
          data-slot='remote-shell'
          data-testid={testId}
          className={cn(
            'grid h-full overflow-hidden overscroll-none [grid-template-areas:"panel_breadcrumb""panel_content"] [grid-template-columns:auto_1fr] [grid-template-rows:auto_1fr]',
            className,
          )}
        >
          {children}
        </div>
      </TestIdProvider>
    </RemoteShellContextProvider>
  );
};

RemoteShell.displayName = 'RemoteShell';
