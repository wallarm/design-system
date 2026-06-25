import { createContext, useContext } from 'react';

interface TreeItemContextValue {
  collapsible: boolean;
  open: boolean;
  toggle: () => void;
}

const TreeItemContext = createContext<TreeItemContextValue>({
  collapsible: false,
  open: false,
  // biome-ignore lint/suspicious/noEmptyBlockStatements: default no-op
  toggle: () => {},
});

export const TreeItemProvider = TreeItemContext.Provider;

export function useTreeItemContext(): TreeItemContextValue {
  return useContext(TreeItemContext);
}
