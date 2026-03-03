import { useEffect, useRef, useState } from 'react';
import type { FilterDropdownItem } from '../types';

interface UseKeyboardNavOptions {
  /** All navigable items (flattened from sections) */
  items: FilterDropdownItem[];
  /** Whether the dropdown is open */
  open: boolean;
  /** Callback when item is selected */
  onSelect: (item: FilterDropdownItem) => void;
  /** Callback when dropdown should close */
  onClose?: () => void;
}

interface UseKeyboardNavReturn {
  /** Current active item index */
  activeIndex: number;
  /** Set active index */
  setActiveIndex: (index: number) => void;
}

/**
 * Hook for keyboard navigation in dropdown menus.
 *
 * Uses a **capture-phase** listener on `window` so it fires before
 * Ark UI's onKeyDown on Menu.Content. Calls `stopPropagation()` to
 * prevent Ark UI from double-handling ArrowUp/Down/Enter/Escape.
 */
export const useKeyboardNav = ({
  items,
  open,
  onSelect,
  onClose,
}: UseKeyboardNavOptions): UseKeyboardNavReturn => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Keep fresh references without re-registering the effect
  const itemsRef = useRef(items);
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  const activeIndexRef = useRef(activeIndex);

  itemsRef.current = items;
  onSelectRef.current = onSelect;
  onCloseRef.current = onClose;
  activeIndexRef.current = activeIndex;

  // Reset activeIndex when menu opens
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setActiveIndex(0);
    }
    prevOpenRef.current = open;
  }, [open]);

  // Keyboard event handler — capture phase to intercept before Ark UI
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentItems = itemsRef.current;
      const total = currentItems.length;
      if (total === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setActiveIndex(prev => {
            let next = (prev + 1) % total;
            while (currentItems[next]?.disabled && next !== prev) {
              next = (next + 1) % total;
            }
            return next;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setActiveIndex(prev => {
            let next = (prev - 1 + total) % total;
            while (currentItems[next]?.disabled && next !== prev) {
              next = (next - 1 + total) % total;
            }
            return next;
          });
          break;

        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          {
            const idx = activeIndexRef.current;
            if (idx >= 0 && idx < total) {
              const item = currentItems[idx];
              if (item && !item.disabled) {
                onSelectRef.current(item);
              }
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          onCloseRef.current?.();
          break;
      }
    };

    // Capture phase: fires before Ark UI's handler on Menu.Content
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [open]);

  return {
    activeIndex,
    setActiveIndex,
  };
};
