import { createContext, useContext } from 'react';

export interface PageLayoutOptions {
  name?: string;
  fullSize?: boolean;
  fixedHeight?: boolean;
}

export interface PageHostContextValue {
  setLayout: (options: PageLayoutOptions) => void;
}

const PageHostContext = createContext<PageHostContextValue | null>(null);

/**
 * Provider used by the host application to receive layout preferences
 * from remote microfrontend `Page` components.
 *
 * @example
 * ```tsx
 * <PageHostProvider value={{ setLayout: handleRemoteLayout }}>
 *   <AppShellRemote>{remoteApp}</AppShellRemote>
 * </PageHostProvider>
 * ```
 */
export const PageHostProvider = PageHostContext.Provider;

/**
 * Returns the host context value, or `null` when no `PageHostProvider`
 * exists (e.g. standalone Storybook / tests).
 */
export function usePageHost(): PageHostContextValue | null {
  return useContext(PageHostContext);
}
