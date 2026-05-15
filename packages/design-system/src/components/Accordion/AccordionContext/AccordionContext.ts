import { createContext } from 'react';

export type AccordionVariant = 'primary' | 'secondary' | 'section';

export interface AccordionContextValue {
  variant: AccordionVariant;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);
