import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { useProductNavContext } from './ProductNavContext';
import type { BreadcrumbSegment, NavStackEntry } from './types';

export interface UseProductNavResult {
  navStack: NavStackEntry[];
  peekDepth: number;
  setPeekDepth: Dispatch<SetStateAction<number>>;
  breadcrumbSegments: BreadcrumbSegment[];
  activeItemId: string | null;
}

/**
 * Hook providing computed nav state + peekDepth management.
 *
 * Reads computed state from ProductNav context.
 * `peekDepth` is the only local mutable state and resets on pathname changes.
 */
export function useProductNav(): UseProductNavResult {
  const { pathname, navStack, breadcrumbSegments, activeItemId } = useProductNavContext();

  const [peekDepth, setPeekDepth] = useState(0);

  useEffect(() => {
    setPeekDepth(0);
  }, [pathname]);

  return {
    navStack,
    peekDepth,
    setPeekDepth,
    breadcrumbSegments,
    activeItemId,
  };
}
