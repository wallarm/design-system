import type { MouseEvent, RefObject } from 'react';
import { useCallback, useRef } from 'react';
import { CHIP_ID_PREFIX, DRAG_THRESHOLD } from './constants';
import { clearDragAttributes, isChipInRange } from './dom';

interface UseDragSelectionOptions {
  chipRegistryRef: RefObject<Map<string, HTMLElement>>;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelectAll: () => void;
}

export const useDragSelection = ({
  chipRegistryRef,
  inputRef,
  onSelectAll,
}: UseDragSelectionOptions) => {
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, button, [role="combobox"]')) return;

      dragStartXRef.current = e.clientX;
      isDraggingRef.current = false;

      const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        if (Math.abs(moveEvent.clientX - dragStartXRef.current) < DRAG_THRESHOLD) return;

        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          document.body.style.userSelect = 'none';
        }

        const registry = chipRegistryRef.current;
        const hasSelected = [...registry.values()].reduce((found, chip) => {
          const inRange = isChipInRange(chip, dragStartXRef.current, moveEvent.clientX);
          if (inRange) chip.setAttribute('data-drag-selected', '');
          else chip.removeAttribute('data-drag-selected');
          return found || inRange;
        }, false);

        if (hasSelected) inputRef.current?.blur();
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';

        if (!isDraggingRef.current) return;

        const registry = chipRegistryRef.current;
        const conditionEntries = [...registry.entries()].filter(([id]) =>
          id.startsWith(CHIP_ID_PREFIX),
        );
        const allDragged =
          conditionEntries.length > 0 &&
          conditionEntries.every(([, el]) => el.hasAttribute('data-drag-selected'));

        if (allDragged) {
          clearDragAttributes(registry);
          onSelectAll();
        }

        isDraggingRef.current = false;
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [chipRegistryRef, inputRef, onSelectAll],
  );

  return { handleMouseDown };
};
