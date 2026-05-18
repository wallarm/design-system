import { type RefObject, useEffect, useRef } from 'react';

const SEQUENCE_TIMEOUT = 1000;

function isEditableTarget(element: Element | null): boolean {
  if (!element) return false;
  const tag = element.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return (element as HTMLElement).isContentEditable;
}

export function useShortcut(
  shortcut: string[] | undefined,
  ref: RefObject<HTMLElement | null>,
): void {
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!shortcut || shortcut.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(document.activeElement)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const expected = shortcut[indexRef.current];
      if (!expected) return;

      if (event.key.toLowerCase() === expected.toLowerCase()) {
        event.preventDefault();
        indexRef.current++;

        if (timerRef.current) clearTimeout(timerRef.current);

        if (indexRef.current === shortcut.length) {
          indexRef.current = 0;
          ref.current?.click();
        } else {
          timerRef.current = setTimeout(() => {
            indexRef.current = 0;
          }, SEQUENCE_TIMEOUT);
        }
      } else {
        indexRef.current = 0;
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [shortcut, ref]);
}
