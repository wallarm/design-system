import { useContext } from 'react';
import { AccordionContext, type AccordionContextValue } from './AccordionContext';

export const useAccordionContext = (): AccordionContextValue => {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('Accordion sub-components must be rendered inside an <Accordion> root');
  }
  return ctx;
};
