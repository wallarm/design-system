import { createContext, useContext } from 'react';

interface ResizableContextValue {
  orientation: 'horizontal' | 'vertical';
}

const ResizableContext = createContext<ResizableContextValue>({
  orientation: 'horizontal',
});

export const ResizableProvider = ResizableContext.Provider;

export function useResizableContext(): ResizableContextValue {
  return useContext(ResizableContext);
}
