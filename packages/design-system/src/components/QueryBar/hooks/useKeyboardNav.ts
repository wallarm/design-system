import { useCallback, useEffect, useRef, useState } from 'react';
import type { QueryBarDropdownItem } from '../types';

interface UseKeyboardNavOptions {
  items: QueryBarDropdownItem[];
  open: boolean;
  onSelect: (item: QueryBarDropdownItem) => void;
  onClose?: () => void;
}

/**
 * Keyboard navigation for filter dropdown menus.
 *
 * Uses a capture-phase listener on `window` to intercept ArrowUp/Down/Enter/Escape
 * before Ark UI Menu handles them (Menu.Content steals focus from the input).
 *
 * Multi-select shortcut: Cmd/Ctrl+Arrow marks items as pending (highlighted),
 * then Enter selects all pending items at once.
 */
export const useKeyboardNav = ({
  items,
  open,
  onSelect,
  onClose,
}: UseKeyboardNavOptions) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // Mutable ref for the latest index — avoids stale closures in navigate
  const activeIndexRef = useRef(0);

  const stateRef = useRef({ items, onSelect, onClose });
  stateRef.current = { items, onSelect, onClose };

  // Reset when menu opens
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setActiveIndex(0);
      activeIndexRef.current = 0;
      setPendingIds(new Set());
    }
    prevOpenRef.current = open;
  }, [open]);

  // Navigate to next enabled item, returns the new index synchronously
  const navigate = useCallback((direction: 1 | -1): number => {
    const { items: list } = stateRef.current;
    const total = list.length;
    if (total === 0) return activeIndexRef.current;

    let next = (activeIndexRef.current + direction + total) % total;
    let attempts = total;
    while (list[next]?.disabled && --attempts > 0) {
      next = (next + direction + total) % total;
    }

    activeIndexRef.current = next;
    setActiveIndex(next);
    return next;
  }, []);

  // Capture-phase keydown
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { items: list, onSelect: select, onClose: close } = stateRef.current;
      if (list.length === 0) return;

      const isMod = e.metaKey || e.ctrlKey;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          e.preventDefault();
          e.stopPropagation();
          if (isMod) {
            // Add current item before moving (so the starting item is included)
            const currentItem = list[activeIndexRef.current];
            const nextIdx = navigate(e.key === 'ArrowDown' ? 1 : -1);
            const nextItem = list[nextIdx];
            setPendingIds(prev => {
              const next = new Set(prev);
              if (currentItem && !currentItem.disabled) next.add(currentItem.id);
              if (nextItem && !nextItem.disabled) next.add(nextItem.id);
              return next;
            });
          } else {
            navigate(e.key === 'ArrowDown' ? 1 : -1);
          }
          break;
        }

        case 'Enter': {
          e.preventDefault();
          e.stopPropagation();
          // Read pending from ref-synced state via functional updater
          setPendingIds(prev => {
            if (prev.size > 0) {
              for (const id of prev) {
                const item = list.find(i => i.id === id);
                if (item && !item.disabled) select(item);
              }
              return new Set();
            }
            // No pending — select current item
            const item = list[activeIndexRef.current];
            if (item && !item.disabled) select(item);
            return prev;
          });
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

  // Sync mouse hover with keyboard
  const onHighlightChange = useCallback((details: { highlightedValue: string | null }) => {
    if (!details.highlightedValue) return;
    const idx = stateRef.current.items.findIndex(item => item.id === details.highlightedValue);
    if (idx >= 0) {
      setActiveIndex(idx);
      activeIndexRef.current = idx;
    }
  }, []);

  const highlightedValue = items[activeIndex]?.id ?? null;

  return { activeIndex, setActiveIndex, highlightedValue, onHighlightChange, pendingIds };
};
