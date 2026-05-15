import type { FC, PropsWithChildren } from 'react';
import { AccordionContext, type AccordionVariant } from './AccordionContext';

interface AccordionContextProviderProps extends PropsWithChildren {
  variant: AccordionVariant;
}

export const AccordionContextProvider: FC<AccordionContextProviderProps> = ({
  children,
  variant,
}) => {
  return <AccordionContext.Provider value={{ variant }}>{children}</AccordionContext.Provider>;
};
