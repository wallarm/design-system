import { createContext, useContext } from 'react';
import type { BreadcrumbSegment, NavConfig, NavConfigDrill, NavStackEntry } from './types';

export interface RemoteShellContextValue {
  config: NavConfig;
  pathname: string;
  navStack: NavStackEntry[];
  breadcrumbSegments: BreadcrumbSegment[];
  activeItemId: string | null;
  /** Effective drill level (accounts for visual back-navigation) */
  drillLevel: number;
  /** Active item ID adjusted for the effective drill level */
  effectiveActiveItemId: string | null;
  /** Navigate to a link item (relative within current drill level) */
  navigate: (path: string) => void;
  /** Enter a drill scope */
  drillInto: (drill: NavConfigDrill) => void;
  /** Return to previous menu level visually (without URL change) */
  goBack: () => void;
  /** Navigate to an absolute href (used by breadcrumbs) */
  navigateTo: (href: string) => void;
}

const RemoteShellCtx = createContext<RemoteShellContextValue | null>(null);

export const RemoteShellContextProvider = RemoteShellCtx.Provider;

export function useRemoteShellContext(): RemoteShellContextValue {
  const ctx = useContext(RemoteShellCtx);
  if (!ctx) {
    throw new Error('useRemoteShellContext must be used within a RemoteShell with a config prop');
  }
  return ctx;
}
