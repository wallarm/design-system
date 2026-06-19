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

// Depth context for nested NavPanelGroup indentation

const NAV_PANEL_BASE_PADDING = 8;
const NAV_PANEL_DEFAULT_INDENT = 24;

interface NavPanelDepthContextValue {
  depth: number;
  indent: number;
}

const NavPanelDepthContext = createContext<NavPanelDepthContextValue>({
  depth: 0,
  indent: NAV_PANEL_DEFAULT_INDENT,
});

export const NavPanelDepthProvider = NavPanelDepthContext.Provider;

export function useNavPanelDepth(): number {
  return useContext(NavPanelDepthContext).depth;
}

export function useNavPanelIndent(): number {
  return useContext(NavPanelDepthContext).indent;
}

export { NAV_PANEL_BASE_PADDING };
