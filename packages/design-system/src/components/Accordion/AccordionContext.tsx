import { createContext, useContext } from 'react';

export type AccordionVariant = 'primary' | 'secondary' | 'section';

export interface AccordionSharedContextValue {
  variant: AccordionVariant;
}

const AccordionSharedContext = createContext<AccordionSharedContextValue | null>(null);

export const AccordionSharedContextProvider = AccordionSharedContext.Provider;

export function useAccordionSharedContext(): AccordionSharedContextValue {
  const ctx = useContext(AccordionSharedContext);
  if (!ctx) {
    throw new Error('Accordion sub-components must be rendered inside an <Accordion> root');
  }
  return ctx;
}
