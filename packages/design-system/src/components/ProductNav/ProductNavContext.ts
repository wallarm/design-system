import { createContext, useContext } from 'react';
import type { BreadcrumbSegment, NavConfig, NavConfigDrill, NavStackEntry } from './types';

export interface ProductNavContextValue {
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

const ProductNavCtx = createContext<ProductNavContextValue | null>(null);

export const ProductNavContextProvider = ProductNavCtx.Provider;

export function useProductNavContext(): ProductNavContextValue {
  const ctx = useContext(ProductNavCtx);
  if (!ctx) {
    throw new Error('useProductNavContext must be used within a ProductNav provider');
  }
  return ctx;
}
