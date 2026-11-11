import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

export const getValidChildren = (children: ReactNode): ReactElement[] =>
  Children.toArray(children).filter(child => isValidElement(child)) as ReactElement[];
