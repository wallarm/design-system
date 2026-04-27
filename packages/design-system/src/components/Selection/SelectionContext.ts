import { createContext } from 'react';
import type { ToggleItemOptions } from './useSelectionState';

export interface SelectionContextValue {
  itemIds: string[];
  enabledItemIds: string[];
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleItem: (id: string, opts?: ToggleItemOptions) => void;
  selectAll: () => void;
  clear: () => void;
  registerDisabled: (id: string, disabled: boolean) => () => void;
}

export const SelectionContext = createContext<SelectionContextValue | null>(null);
