import { useCallback, useEffect, useRef, useState } from 'react';
import type { FilterDropdownItem } from '../types';

interface UseKeyboardNavOptions {
  items: FilterDropdownItem[];
  open: boolean;
  onSelect: (item: FilterDropdownItem) => void;
  onClose?: () => void;
}

/**
 * Keyboard navigation for filter dropdown menus.
 *
 * Uses a capture-phase listener on `window` to intercept ArrowUp/Down/Enter/Escape
 * before Ark UI Menu handles them (Menu.Content steals focus from the input).
 *
 * Syncs with Ark UI's highlight system via `highlightedValue` / `onHighlightChange`.
 */
export const useKeyboardNav = ({
  items,
  open,
  onSelect,
  onClose,
}: UseKeyboardNavOptions) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Single ref object to avoid re-registering the effect on every render
  const stateRef = useRef({ items, onSelect, onClose, activeIndex });
  stateRef.current = { items, onSelect, onClose, activeIndex };

  // Reset highlight when menu opens
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) setActiveIndex(0);
    prevOpenRef.current = open;
  }, [open]);

  // Navigate to next enabled item in given direction (+1 or -1)
  const navigate = useCallback((direction: 1 | -1) => {
    setActiveIndex(prev => {
      const { items: list } = stateRef.current;
      const total = list.length;
      if (total === 0) return prev;

      let next = (prev + direction + total) % total;
      // Skip disabled items (with safety to avoid infinite loop)
      let attempts = total;
      while (list[next]?.disabled && --attempts > 0) {
        next = (next + direction + total) % total;
      }
      return next;
    });
  }, []);

  // Capture-phase keydown — fires before Ark UI's handler on Menu.Content
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { items: list, onSelect: select, onClose: close, activeIndex: idx } = stateRef.current;
      if (list.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          navigate(1);
          break;

        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          navigate(-1);
          break;

        case 'Enter': {
          e.preventDefault();
          e.stopPropagation();
          const item = list[idx];
          if (item && !item.disabled) select(item);
          break;
        }

        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          close?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [open, navigate]);

  // Sync mouse hover highlight with keyboard activeIndex
  const onHighlightChange = useCallback((details: { highlightedValue: string | null }) => {
    if (!details.highlightedValue) return;
    const idx = stateRef.current.items.findIndex(item => item.id === details.highlightedValue);
    if (idx >= 0) setActiveIndex(idx);
  }, []);

  const highlightedValue = items[activeIndex]?.id ?? null;

  return { activeIndex, setActiveIndex, highlightedValue, onHighlightChange };
};
