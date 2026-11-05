import { useEffect, useState } from 'react';
import type { Proton } from './types';

let protonInstance: Proton | null = null;
let protonPromise: Promise<Proton> | null = null;

/**
 * Initialize proton SDK (loads WebAssembly module ~75KB brotli)
 *
 * Safe to call multiple times - returns cached instance.
 * First call compiles WASM (~2ms).
 *
 * For Vite dev server, WASM URL must be passed explicitly.
 * For webpack/production, SDK auto-detects via import.meta.url.
 *
 * @example
 * ```typescript
 * // Webpack/production
 * const proton = await initProton();
 *
 * // Vite (dev)
 * import wasmUrl from 'proton-new-js/proton-point.wasm?url';
 * const proton = await initProton(wasmUrl);
 * ```
 */
export async function initProton(wasmUrl?: string): Promise<Proton> {
  if (protonInstance) return protonInstance;
  if (protonPromise) return protonPromise;

  protonPromise = (async () => {
    try {
      // Dynamic import to avoid bundler issues
      const { init } = await import('proton-new-js');
      const proton = await init(wasmUrl);
      protonInstance = proton as unknown as Proton;
      return proton as unknown as Proton;
    } catch (error) {
      protonPromise = null; // Allow retry on next call
      throw new Error(`Failed to initialize proton SDK: ${error}`);
    }
  })();

  return protonPromise;
}

/**
 * React hook for proton SDK
 *
 * Loads SDK on mount. Returns [proton, error, retry] tuple.
 *
 * @example
 * ```typescript
 * function PointEditor() {
 *   const [proton, error, retry] = useProton();
 *   if (error) return <div>Error: {error.message} <button onClick={retry}>Retry</button></div>;
 *   if (!proton) return <div>Loading...</div>;
 *   return <PointSelector proton={proton} />;
 * }
 * ```
 */
export function useProton(wasmUrl?: string): [Proton | null, Error | null, () => void] {
  const [proton, setProton] = useState<Proton | null>(protonInstance);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryCount is intentional trigger
  useEffect(() => {
    if (protonInstance) {
      setProton(protonInstance);
      setError(null);
      return;
    }

    setError(null);
    initProton(wasmUrl).then(setProton).catch(setError);
  }, [wasmUrl, retryCount]);

  const retry = () => {
    setRetryCount(c => c + 1);
  };

  return [proton, error, retry];
}
