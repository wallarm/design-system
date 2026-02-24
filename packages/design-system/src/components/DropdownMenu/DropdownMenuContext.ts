import { createContext, useContext } from 'react';

interface DropdownMenuContextValue {
  isNested: boolean;
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export const useDropdownMenuContext = () => useContext(DropdownMenuContext);
