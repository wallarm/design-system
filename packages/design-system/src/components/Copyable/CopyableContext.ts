import { createContext, useContext } from 'react';

interface CopyableContextValue {
  copied: boolean;
}

const CopyableContext = createContext<CopyableContextValue | null>(null);

export const CopyableProvider = CopyableContext.Provider;

/**
 * Read the `copied` state from the nearest `<Copyable>` ancestor.
 *
 * @throws when called outside a `<Copyable>` tree.
 */
export function useCopyable(): CopyableContextValue {
  const ctx = useContext(CopyableContext);
  if (!ctx) {
    throw new Error('useCopyable must be used within a <Copyable> component');
  }
  return ctx;
}
