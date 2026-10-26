import { createContext, useContext } from 'react';

interface TreeItemContextValue {
  collapsible: boolean;
  open: boolean;
  toggle: () => void;
}

const TreeItemContext = createContext<TreeItemContextValue>({
  collapsible: false,
  open: false,
  // default no-op
  toggle: () => {},
});

export const TreeItemProvider = TreeItemContext.Provider;

export function useTreeItemContext(): TreeItemContextValue {
  return useContext(TreeItemContext);
}
