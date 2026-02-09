import { type ReactNode, useEffect, useState } from 'react';
import type { SyntaxAdapter } from './adapters/types';
import { AdapterContext, type AdapterContextValue } from './CodeSnippetContext';

type AdapterInput<TLanguage extends string> =
  | SyntaxAdapter<TLanguage>
  | (() => Promise<SyntaxAdapter<TLanguage>>);

export type CodeSnippetAdapterProviderProps<TLanguage extends string = string> = {
  /**
   * Syntax adapter or a loader function that returns a Promise of the adapter.
   * Using a loader function enables code splitting - the adapter bundle will
   * only be loaded when the component mounts.
   *
   * @example
   * // Synchronous adapter (bundled immediately)
   * <CodeSnippetAdapterProvider adapter={prismAdapter}>
   *
   * @example
   * // Lazy adapter (loaded on mount)
   * <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
   */
  adapter: AdapterInput<TLanguage>;
  children: ReactNode;
};

export function CodeSnippetAdapterProvider<TLanguage extends string>({
  adapter,
  children,
}: CodeSnippetAdapterProviderProps<TLanguage>) {
  const [resolvedAdapter, setResolvedAdapter] = useState<SyntaxAdapter<TLanguage> | null>(
    typeof adapter === 'function' ? null : adapter,
  );

  useEffect(() => {
    if (typeof adapter !== 'function') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolvedAdapter(adapter);
      return;
    }

    let cancelled = false;

    const loadAdapter = async () => {
      const loadedAdapter = await adapter();
      if (!cancelled) {
        setResolvedAdapter(loadedAdapter);
      }
    };

    loadAdapter();

    return () => {
      cancelled = true;
    };
  }, [adapter]);

  // Don't provide context until adapter is loaded - CodeSnippetRoot will use plainAdapter as fallback
  const value: AdapterContextValue<TLanguage> | null = resolvedAdapter
    ? { adapter: resolvedAdapter }
    : null;

  return (
    <AdapterContext.Provider value={value as unknown as AdapterContextValue}>
      {children}
    </AdapterContext.Provider>
  );
}

CodeSnippetAdapterProvider.displayName = 'CodeSnippetAdapterProvider';
