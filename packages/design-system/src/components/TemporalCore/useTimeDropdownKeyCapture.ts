import { type KeyboardEvent, type RefObject, useCallback } from 'react';
import type { TimeDropdownHandle } from './TimeDropdown';

const TIME_SEGMENT_TYPES = new Set(['hour', 'minute', 'second', 'dayPeriod']);

function isFocusedSegmentTimeType(): boolean {
  const segmentType = document.activeElement?.getAttribute('data-segment');
  return segmentType != null && TIME_SEGMENT_TYPES.has(segmentType);
}

/**
 * Capture-phase keydown handler for inputs with a TimeDropdown.
 *
 * - Dropdown OPEN:  ArrowUp/Down/Enter/Escape → forwarded to dropdown;
 *                   ArrowLeft/Right → blocked (no segment switch).
 * - Dropdown CLOSED: Enter → opens dropdown;
 *                    ArrowUp/Down & digits on time segments → blocked.
 */
export function useTimeDropdownKeyCapture({
  enabled,
  isOpen,
  dropdownRef,
  onOpen,
}: {
  enabled: boolean;
  isOpen: boolean;
  dropdownRef: RefObject<TimeDropdownHandle | null>;
  onOpen: () => void;
}): (e: KeyboardEvent) => void {
  return useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      if (isOpen) {
        if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
          e.stopPropagation();
          e.preventDefault();
          dropdownRef.current?.handleKeyDown(e);
        } else if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.stopPropagation();
          e.preventDefault();
        }
      } else if (e.key === 'Enter') {
        e.stopPropagation();
        e.preventDefault();
        onOpen();
      } else if (['ArrowUp', 'ArrowDown'].includes(e.key) && isFocusedSegmentTimeType()) {
        e.stopPropagation();
        e.preventDefault();
      } else if (e.key >= '0' && e.key <= '9' && isFocusedSegmentTimeType()) {
        e.stopPropagation();
        e.preventDefault();
      }
    },
    [enabled, isOpen, dropdownRef, onOpen],
  );
}
