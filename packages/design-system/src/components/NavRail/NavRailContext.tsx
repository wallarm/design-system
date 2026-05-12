import { createContext, useContext } from 'react';

interface NavRailContextValue {
  collapsed: boolean;
}

const NavRailCtx = createContext<NavRailContextValue>({ collapsed: false });

export const NavRailContextProvider = NavRailCtx.Provider;

export function useNavRailContext(): NavRailContextValue {
  return useContext(NavRailCtx);
}
