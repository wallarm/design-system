import { useCallback, useRef, useState } from 'react';
import { copyText } from '../utils/copyText';

/**
 * Hook for copying text to clipboard with status tracking.
 *
 * Uses the Clipboard API with an `execCommand` fallback for older browsers.
 * The `copied` flag auto-resets after `resetDelay` ms.
 *
 * @param resetDelay - Time in ms before `copied` resets to false (default: 2000)
 * @returns `{ copied, copy }` — `copied` is `true` while the feedback window is active
 *
 * @example
 * ```tsx
 * const { copied, copy } = useCopyToClipboard();
 *
 * <button onClick={() => copy('text to copy')}>
 *   {copied ? 'Copied!' : 'Copy'}
 * </button>
 * ```
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = useCallback(
    (text: string) => {
      copyText(text);
      setCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
    },
    [resetDelay],
  );

  return { copied, copy };
}
