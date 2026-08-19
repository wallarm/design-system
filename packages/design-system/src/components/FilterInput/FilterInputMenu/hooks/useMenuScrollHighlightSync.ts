import { useEffect, useRef } from 'react';

/**
 * Keeps the field-menu highlight — and the description popover that follows it —
 * on the row under the cursor when the list scrolls beneath a stationary pointer
 * (wheel/trackpad). Ark moves the highlight only on `pointermove`, so a scroll
 * would otherwise strand it. On scroll we hit-test the last pointer and drive the
 * highlight via `onHighlightChange` (a synthetic `pointermove` is ignored by zag
 * when the position is unchanged). Guarded off during arrow-key nav so a resting
 * pointer can't hijack the keyboard. Pass `enabled` for the whole time the menu
 * is visible so the pointer is tracked before the first scroll (AS-1060).
 */
export const useMenuScrollHighlightSync = (
  enabled: boolean,
  onHighlightChange: (details: { highlightedValue: string | null }) => void,
): void => {
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const keyboardNavRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const trackPointer = (e: PointerEvent) => {
      keyboardNavRef.current = false;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const trackKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') keyboardNavRef.current = true;
    };
    let raf = 0;
    const onScroll = () => {
      if (raf || keyboardNavRef.current) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const p = lastPointerRef.current;
        if (!p) return;
        // Scope by `data-filter-input-menu` so a pointer outside this menu is ignored.
        const item = document.elementFromPoint(p.x, p.y)?.closest('[role="menuitem"]');
        if (!item?.closest('[data-filter-input-menu="true"]')) return;
        const value = item.getAttribute('data-value');
        if (value) onHighlightChange({ highlightedValue: value });
      });
    };
    window.addEventListener('pointermove', trackPointer, true);
    window.addEventListener('keydown', trackKeyboard, true);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('pointermove', trackPointer, true);
      window.removeEventListener('keydown', trackKeyboard, true);
      window.removeEventListener('scroll', onScroll, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, onHighlightChange]);
};
