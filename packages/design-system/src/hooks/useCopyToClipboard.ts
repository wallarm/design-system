import { useCallback, useRef, useState } from 'react';

const isClipboardSupported =
  typeof navigator !== 'undefined' &&
  typeof navigator.clipboard !== 'undefined' &&
  typeof navigator.clipboard.writeText === 'function';

/**
 * Hook for copying text to clipboard with status tracking.
 *
 * @param resetDelay - Time in ms before `copied` resets to false (default: 2000)
 * @returns Object with `copied` state, `copy` function, `reset` function, and `isSupported` flag
 *
 * @example
 * ```tsx
 * const { copied, copy, reset, isSupported } = useCopyToClipboard();
 *
 * {isSupported && (
 *   <button onClick={() => copy('text to copy')}>
 *     {copied ? 'Copied!' : 'Copy'}
 *   </button>
 * )}
 * ```
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCopied(false);
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!isClipboardSupported) {
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
        return true;
      } catch {
        // Clipboard access denied or other error
        return false;
      }
    },
    [resetDelay],
  );

  return { copied, copy, reset, isSupported: isClipboardSupported };
}
