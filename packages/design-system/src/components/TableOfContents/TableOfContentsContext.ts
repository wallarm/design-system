import { createContext, useContext } from 'react';

export interface TableOfContentsContextValue {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  /** `row` — a link row (Full view, popover); `dash` — a decorative dash (Minimized view). */
  mode: 'row' | 'dash';
  /** Called after an item click was handled — closes the Minimized popover. */
  onItemSelect?: () => void;
}

export const TableOfContentsContext = createContext<TableOfContentsContextValue>({
  value: undefined,
  onValueChange: undefined,
  mode: 'row',
});

export const useTableOfContentsContext = () => useContext(TableOfContentsContext);
