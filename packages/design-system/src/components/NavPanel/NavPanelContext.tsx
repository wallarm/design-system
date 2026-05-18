import { createContext, type Dispatch, type SetStateAction, useContext } from 'react';

interface NavPanelInternalContextValue {
  width: number;
  setWidth: Dispatch<SetStateAction<number>>;
  isResizing: boolean;
  setIsResizing: Dispatch<SetStateAction<boolean>>;
  minWidth: number;
  maxWidth: number;
}

const NavPanelInternalContext = createContext<NavPanelInternalContextValue | null>(null);

export const NavPanelInternalProvider = NavPanelInternalContext.Provider;

export function useNavPanelInternalContext(): NavPanelInternalContextValue {
  const ctx = useContext(NavPanelInternalContext);
  if (!ctx) {
    throw new Error('useNavPanelInternalContext must be used within NavPanelInternalProvider');
  }
  return ctx;
}
