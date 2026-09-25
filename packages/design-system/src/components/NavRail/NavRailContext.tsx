import { createContext, useContext } from 'react';

export type NavRailMode = 'expanded' | 'collapsed' | 'compact';

interface NavRailContextValue {
  mode: NavRailMode;
}

const NavRailCtx = createContext<NavRailContextValue>({ mode: 'expanded' });

export const NavRailContextProvider = NavRailCtx.Provider;

export function useNavRailContext(): NavRailContextValue {
  return useContext(NavRailCtx);
}
