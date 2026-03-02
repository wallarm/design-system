import { useEffect, useRef, useState } from 'react';
import type { FilterDropdownItem } from './types';

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
  /** Refs array for items (for auto-scroll) */
  itemRefs: React.MutableRefObject<(HTMLElement | null)[]>;
  /** Ref for menu container */
  menuRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for keyboard navigation in dropdown menus
 * Handles Arrow Up/Down, Enter, and Escape keys
 */
export function useKeyboardNav({
  items,
  open,
  onSelect,
  onClose,
}: UseKeyboardNavOptions): UseKeyboardNavReturn {
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const totalItems = items.length;

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => {
            // Skip disabled items when navigating
            let nextIndex = (prev + 1) % totalItems;
            while (items[nextIndex]?.disabled && nextIndex !== prev) {
              nextIndex = (nextIndex + 1) % totalItems;
            }
            return nextIndex;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => {
            // Skip disabled items when navigating
            let nextIndex = (prev - 1 + totalItems) % totalItems;
            while (items[nextIndex]?.disabled && nextIndex !== prev) {
              nextIndex = (nextIndex - 1 + totalItems) % totalItems;
            }
            return nextIndex;
          });
          break;

        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < totalItems) {
            const item = items[activeIndex];
            if (item && !item.disabled) {
              onSelect(item);
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, activeIndex, totalItems, items, onSelect, onClose]);

  // Auto-scroll to active item
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  return {
    activeIndex,
    setActiveIndex,
    itemRefs,
    menuRef,
  };
}
