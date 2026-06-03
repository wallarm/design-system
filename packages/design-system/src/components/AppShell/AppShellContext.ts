import { createContext, useContext } from 'react';

interface AppShellContextValue {
  appeared: boolean;
}

export const AppShellContext = createContext<AppShellContextValue>({ appeared: true });

export const useAppShellAppeared = () => useContext(AppShellContext).appeared;
