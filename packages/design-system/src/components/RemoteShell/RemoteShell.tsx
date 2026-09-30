import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import type { NavConfig, NavConfigDrill } from './model';
import {
  findFirstLinkPath,
  matchNav,
  notifyPathnameChanged,
  pushPathname,
  RemoteShellContextProvider,
  useLocationPathname,
} from './model';

/** Strips `basePath` only on a segment boundary: `/edge-nodes` is not under `/edge`. */
const stripBasePath = (fullPathname: string, basePath: string | undefined): string => {
  if (!basePath) return fullPathname;
  if (fullPathname === basePath) return '/';
  return fullPathname.startsWith(`${basePath}/`)
    ? fullPathname.slice(basePath.length)
    : fullPathname;
};

interface DrillOverride {
  level: number;
  /** Pathname (basePath stripped) the override was set for. */
  pathname: string;
}

export interface RemoteShellProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  /** Navigation config used to build nav state for sub-components. */
  config: NavConfig;
  /** URL prefix stripped before matching and prepended when navigating (e.g. `"/edge"`). */
  basePath?: string;
  /**
   * Current pathname. When set, it is the single source of truth for the active nav
   * item, drill level and breadcrumbs, and `window.location` is ignored.
   *
   * Pass it — **together with `onNavigate`** — whenever a router owns the URL: router
   * navigations (links in page content, `router.navigate`, memory history, the host's
   * rail) do not fire `popstate`, so without it the shell can go stale. Without
   * `onNavigate` the shell's own navigations would only reach `window.history`, which
   * a controlled shell ignores (a dev warning flags this).
   *
   * Either form is accepted: with the `basePath` prefix (what `onNavigate` receives) or
   * without it — the prefix is stripped only when the pathname starts with a whole
   * `basePath` segment. With TanStack Router, `useRouterState({ select: s =>
   * s.location.pathname })` is router-relative: it excludes the router's own
   * `basepath`. So when the router has `basepath`:
   * - omit `basePath` here — `pathname` and `onNavigate` are then both router-relative
   *   and `onNavigate={to => navigate({ to })}` is correct; or
   * - keep `basePath` and strip it in `onNavigate`
   *   (`to => navigate({ to: to.slice(basePath.length) || '/' })`), otherwise the
   *   router prefixes it a second time.
   *
   * Omit it to read `window.location.pathname` (updated on `popstate` and on the
   * shell's own navigations).
   */
  pathname?: string;
  /**
   * Navigation handler for router integration (TanStack Router, React Router,
   * Next.js, …). Receives the target pathname, prefixed with `basePath` when one is
   * set. Without it the shell pushes to `window.history` itself.
   */
  onNavigate?: (pathname: string) => void;
}

export const RemoteShell: FC<RemoteShellProps> = ({
  ref,
  className,
  children,
  config,
  basePath,
  onNavigate,
  pathname: controlledPathname,
  'data-testid': testId,
  ...props
}) => {
  // Always subscribed (hooks can't be conditional); ignored when controlled.
  const locationPathname = useLocationPathname();
  const fullPathname = controlledPathname ?? locationPathname;

  const pathname = stripBasePath(fullPathname, basePath);

  const isControlled = controlledPathname !== undefined;
  const hasOnNavigate = onNavigate !== undefined;
  useEffect(() => {
    if (isControlled && !hasOnNavigate && process.env.NODE_ENV !== 'production') {
      // biome-ignore lint/suspicious/noConsole: dev-only misuse warning
      console.warn(
        '[RemoteShell] `pathname` is controlled but `onNavigate` is missing: shell navigations will update `window.history` only, and the shell will keep showing the old route. Pass `onNavigate` to route them through your router.',
      );
    }
  }, [isControlled, hasOnNavigate]);

  const setPathname = useCallback(
    (next: string) => {
      const fullPath = basePath ? `${basePath}${next}` : next;
      if (onNavigate) {
        onNavigate(fullPath);
        // Uncontrolled + external router: the router may have updated
        // `window.location` without a `popstate`, so re-read it. A no-op when the
        // pathname is controlled — the parent passes the new value instead.
        notifyPathnameChanged();
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

  // Visual drill level override — lets the menu show a different level than the URL
  // implies (after clicking "back"). It is bound to the pathname it was set for and
  // only honoured while that pathname is current, so a URL change drops it in the very
  // same render (no effect, no one-render lag that would make `useDrillTransition` see
  // a spurious level change).
  const [drillOverride, setDrillOverride] = useState<DrillOverride | null>(null);
  const visualDrillLevel = drillOverride?.pathname === pathname ? drillOverride.level : null;

  // Forget an override once its pathname is no longer current, so returning to that
  // pathname later doesn't resurrect it. Adjusting state during render (React's
  // "storing information from previous renders" pattern) — not derived-state-in-effect.
  if (drillOverride && drillOverride.pathname !== pathname) {
    setDrillOverride(null);
  }

  // Effective values accounting for visual override
  const effectiveDrillLevel = visualDrillLevel ?? urlDrillLevel;
  const effectiveActiveItemId =
    effectiveDrillLevel < urlDrillLevel
      ? (navStack[effectiveDrillLevel]?.activeItemId ?? activeItemId)
      : activeItemId;

  // Number of pathname segments consumed to reach the effective drill level. Each
  // traversed drill consumes 2 segments (path + param), except a pathless drill
  // (`path: ''`), which consumes 1 — so this can't be derived as `effectiveDrillLevel * 2`
  // once a pathless drill is in the stack; `matchNav` tracks the real count per level.
  const prefixSegmentCount = navStack[effectiveDrillLevel]?.segmentCount ?? effectiveDrillLevel * 2;

  // handlers
  const navigate = useCallback(
    (path: string) => {
      setDrillOverride(null);
      const segments = pathname
        .replace(/^\/+|\/+$/g, '')
        .split('/')
        .filter(Boolean);
      const prefixSegments = segments.slice(0, prefixSegmentCount);
      setPathname(`/${[...prefixSegments, path].join('/')}`);
    },
    [prefixSegmentCount, pathname, setPathname],
  );

  const drillInto = useCallback(
    (drill: NavConfigDrill) => {
      setDrillOverride(null);
      const segments = pathname
        .replace(/^\/+|\/+$/g, '')
        .split('/')
        .filter(Boolean);
      const prefixSegments = segments.slice(0, prefixSegmentCount);
      const defaultEntity = drill.entities?.[0]?.id ?? 'default';
      const firstChildPath = findFirstLinkPath(drill.children) ?? '';
      // A pathless drill (`path: ''`) contributes no segment of its own — skip it so no
      // empty segment leaks into the URL (which would otherwise render as `//`).
      const parts =
        drill.path === ''
          ? [...prefixSegments, defaultEntity, firstChildPath]
          : [...prefixSegments, drill.path, defaultEntity, firstChildPath];
      setPathname(`/${parts.join('/')}`);
    },
    [prefixSegmentCount, pathname, setPathname],
  );

  const goBack = useCallback(() => {
    setDrillOverride(prev => {
      const current = prev?.pathname === pathname ? prev.level : urlDrillLevel;
      return { level: Math.max(current - 1, 0), pathname };
    });
  }, [pathname, urlDrillLevel]);

  const navigateTo = useCallback(
    (href: string) => {
      setDrillOverride(null);
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
            '[&:has([data-slot=page-header],[data-slot=settings-header])_[data-slot=remote-shell-breadcrumb]]:pb-4',
            '[&:has([data-slot=remote-shell-breadcrumb])_:is([data-slot=page-header],[data-slot=settings-header])]:pt-4',
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
