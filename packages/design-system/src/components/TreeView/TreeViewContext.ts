import { createContext, useContext } from 'react';

export interface TreeViewContextValue {
  /** Whether rows can be selected by clicking. */
  selectable: boolean;
  /** Allow multiple rows to be selected at once. */
  multiSelect: boolean;
  /** Currently selected item ids. */
  selectedIds: Set<string>;
  /** Toggle selection for a given item id. */
  toggleSelect: (id: string) => void;
  /** Render a checkbox on every item (item-level `checkbox` still overrides). */
  checkboxes: boolean;
}

const TreeViewContext = createContext<TreeViewContextValue | null>(null);

export const TreeViewProvider = TreeViewContext.Provider;

export function useTreeViewContext(): TreeViewContextValue {
  const ctx = useContext(TreeViewContext);
  if (ctx === null) {
    throw new Error('TreeView sub-components must be used within a <TreeView>');
  }
  return ctx;
}
