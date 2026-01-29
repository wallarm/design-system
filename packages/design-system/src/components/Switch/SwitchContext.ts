import { createContext } from 'react';

export interface SwitchContextValue {
  a11yMode: boolean;
}

export const SwitchContext = createContext<SwitchContextValue>({
  a11yMode: false,
});
