import { createContext, useContext } from 'react';

export type AttributeOrientation = 'vertical' | 'horizontal';

const AttributeOrientationContext = createContext<AttributeOrientation>('vertical');

export const AttributeOrientationProvider = AttributeOrientationContext.Provider;

export const useAttributeOrientation = (): AttributeOrientation =>
  useContext(AttributeOrientationContext);
