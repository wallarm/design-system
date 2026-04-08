import type { MouseEvent, RefObject } from 'react';
import { useCallback, useRef } from 'react';
import { DRAG_THRESHOLD, getVisualEntries, resolveAnchorChipId, updateDragSelection } from './lib';

/** Elements that should keep default behavior instead of starting a drag */
const DRAG_IGNORE_SELECTOR = 'input, [role="combobox"]';

interface UseDragSelectionOptions {
  chipRegistryRef: RefObject<Map<string, HTMLElement>>;
  inputRef: RefObject<HTMLInputElement | null>;
  closeMenu: () => void;
}

export const useDragSelection = ({
  chipRegistryRef,
  inputRef,
  closeMenu,
}: UseDragSelectionOptions) => {
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const anchorChipIdRef = useRef<string | null>(null);
  const visualEntriesRef = useRef<ReturnType<typeof getVisualEntries>>([]);

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      // Allow drag to start from buttons (InsertionGap, chip remove) — their click
      // handlers fire on mouseup and won't conflict with drag (4px threshold).
      if (target.closest(DRAG_IGNORE_SELECTOR)) return;

      dragStartXRef.current = e.clientX;
      dragStartYRef.current = e.clientY;
      isDraggingRef.current = false;
      anchorChipIdRef.current = resolveAnchorChipId(
        chipRegistryRef.current,
        target,
        e.clientX,
        e.clientY,
      );
      // Cache visual entries once per drag — rects don't change during drag
      visualEntriesRef.current = getVisualEntries(chipRegistryRef.current);

      const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        const dx = moveEvent.clientX - dragStartXRef.current;
        const dy = moveEvent.clientY - dragStartYRef.current;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          document.body.style.userSelect = 'none';
          closeMenu();
          inputRef.current?.blur();
        }

        if (anchorChipIdRef.current) {
          updateDragSelection(
            visualEntriesRef.current,
            anchorChipIdRef.current,
            moveEvent.clientX,
            moveEvent.clientY,
          );
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        isDraggingRef.current = false;
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [chipRegistryRef, inputRef, closeMenu],
  );

  return { handleMouseDown };
};
