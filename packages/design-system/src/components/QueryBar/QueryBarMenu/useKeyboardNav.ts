import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { QueryBarDropdownItem } from '../types';

interface UseKeyboardNavOptions {
  items: QueryBarDropdownItem[];
  open: boolean;
  onSelect: (item: QueryBarDropdownItem) => void;
  onClose?: () => void;
  onArrowRight?: () => void;
  /** Called after all pending items are selected via Cmd+Enter */
  onPendingCommit?: () => void;
  /** When true, ArrowRight selects the active item (like Enter) instead of calling onArrowRight */
  arrowRightSelectsActive?: boolean;
  /** When provided, ArrowUp on the first item returns focus to this input */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Ref to the menu content element — used for scoped queries and focus management */
  menuRef?: RefObject<HTMLDivElement | null>;
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
  onArrowRight,
  onPendingCommit,
  arrowRightSelectsActive = false,
  inputRef,
  menuRef,
}: UseKeyboardNavOptions) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // Mutable ref for the latest index — avoids stale closures in navigate
  const activeIndexRef = useRef(-1);

  const pendingIdsRef = useRef(pendingIds);
  pendingIdsRef.current = pendingIds;

  const stateRef = useRef({
    items,
    onSelect,
    onClose,
    onArrowRight,
    onPendingCommit,
    arrowRightSelectsActive,
    inputRef,
    menuRef,
  });
  stateRef.current = { items, onSelect, onClose, onArrowRight, onPendingCommit, arrowRightSelectsActive, inputRef, menuRef };

  // Reset when menu opens
  const prevOpenRef = useRef(open);
  const prevItemsLenRef = useRef(items.length);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setActiveIndex(-1);
      activeIndexRef.current = -1;
      setPendingIds(new Set());
    }
    prevOpenRef.current = open;
  }, [open]);

  // Clamp activeIndex when items list changes (e.g. filtering)
  useEffect(() => {
    if (items.length !== prevItemsLenRef.current) {
      prevItemsLenRef.current = items.length;
      if (activeIndexRef.current >= items.length) {
        const clamped = items.length > 0 ? items.length - 1 : -1;
        activeIndexRef.current = clamped;
        setActiveIndex(clamped);
      }
    }
  }, [items.length]);

  // Navigate to next enabled item, returns the new index synchronously
  const navigate = useCallback((direction: 1 | -1): number => {
    const { items: list } = stateRef.current;
    const total = list.length;
    if (total === 0) return activeIndexRef.current;

    // First navigation — start from the beginning (down) or end (up)
    const current = activeIndexRef.current;
    const start =
      current === -1 ? (direction === 1 ? 0 : total - 1) : (current + direction + total) % total;

    const next =
      Array.from({ length: total }, (_, i) => (start + i * direction + total * total) % total).find(
        idx => !list[idx]?.disabled,
      ) ?? start;

    activeIndexRef.current = next;
    setActiveIndex(next);

    // Scroll the highlighted item into view (deferred so Ark UI applies data-highlighted first)
    const itemId = list[next]?.id;
    if (itemId) {
      requestAnimationFrame(() => {
        const container = stateRef.current.menuRef?.current;
        const el = container?.querySelector<HTMLElement>(
          `[role="menuitem"][data-value="${CSS.escape(itemId)}"]`,
        );
        el?.scrollIntoView({ block: 'nearest' });
      });
    }

    return next;
  }, []);

  // Cmd/Ctrl+Arrow multi-select helper — marks current + next items as pending
  const suppressHighlightRef = useRef(false);
  const handleModArrow = useCallback((e: KeyboardEvent) => {
    const { items: list } = stateRef.current;
    e.preventDefault();
    // stopImmediatePropagation prevents other capture-phase listeners on window
    // (e.g. Ark UI / zag.js) from also processing Cmd+Arrow as "jump to end".
    // Side-effect: any other global Cmd+Arrow listeners on window won't fire.
    e.stopImmediatePropagation();
    suppressHighlightRef.current = true;
    const currentItem = list[activeIndexRef.current];
    const nextIdx = navigate(e.key === 'ArrowDown' ? 1 : -1);
    const nextItem = list[nextIdx];
    setPendingIds(prev => {
      const next = new Set(prev);
      if (currentItem && !currentItem.disabled) next.add(currentItem.id);
      if (nextItem && !nextItem.disabled) next.add(nextItem.id);
      return next;
    });
    // Assumes Ark UI fires onHighlightChange within the same frame as the
    // controlled-prop update. If Ark UI defers further, this window is too short.
    requestAnimationFrame(() => {
      suppressHighlightRef.current = false;
    });
  }, [navigate]);

  // Capture-phase keydown
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only intercept events from *our* QueryBar menu, not from nested dropdowns (e.g. connector chip)
      const target = e.target as HTMLElement | null;
      const inMenu = menuRef?.current?.contains(target);
      const isMod = e.metaKey || e.ctrlKey;

      // ── Focus is inside the menu ──────────────────────────
      if (inMenu) {
        // Cmd+Arrow → multi-select (intercept before Ark UI)
        if (isMod && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
          handleModArrow(e);
          return;
        }
        // Enter with pending items → select all pending, then commit
        if (e.key === 'Enter' && pendingIdsRef.current.size > 0) {
          e.preventDefault();
          e.stopPropagation();
          const { items: list, onSelect: select, onPendingCommit: commit } = stateRef.current;
          pendingIdsRef.current.forEach(id => {
            const item = list.find(i => i.id === id);
            if (item && !item.disabled) select(item);
          });
          setPendingIds(new Set());
          // Defer commit so toggled state is flushed first
          queueMicrotask(() => commit?.());
          return;
        }
        // ArrowRight → select active item and advance, or commit checked values
        if (e.key === 'ArrowRight') {
          const { onArrowRight: arrowRight, arrowRightSelectsActive: selectsActive, items: list, onSelect: select } = stateRef.current;
          if (!arrowRight) return;
          e.preventDefault();
          e.stopPropagation();
          if (pendingIdsRef.current.size > 0) {
            pendingIdsRef.current.forEach(id => {
              const item = list.find(i => i.id === id);
              if (item && !item.disabled) select(item);
            });
            setPendingIds(new Set());
            queueMicrotask(() => arrowRight());
          } else if (selectsActive && activeIndexRef.current >= 0) {
            // Single-select: select highlighted item (onSelect handler advances the flow)
            const item = list[activeIndexRef.current];
            if (item && !item.disabled) select(item);
          } else {
            arrowRight();
          }
          return;
        }
        // ArrowUp on first item → return focus to input
        const { inputRef: iRef } = stateRef.current;
        if (e.key === 'ArrowUp' && iRef?.current && activeIndexRef.current === 0) {
          e.preventDefault();
          e.stopPropagation();
          iRef.current.focus();
        }
        // Everything else — let Ark UI handle natively
        return;
      }

      // ── Focus is on a segment inline-edit input ──
      // Only intercept ArrowDown/Up (menu navigation) and Escape (close).
      // Enter must propagate to the segment's onKeyDown for value commit.
      const isSegmentInput = (e.target as HTMLElement)?.closest?.('[data-slot^="segment-"]');
      if (isSegmentInput && e.key !== 'Escape' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

      // ── Focus is on the input ─────────────────────────────
      const {
        items: list,
        onSelect: select,
        onClose: close,
        onArrowRight: arrowRight,
      } = stateRef.current;
      if (list.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          if (isMod) {
            handleModArrow(e);
            break;
          }
          // Plain arrow from input → navigate to first/last item and focus the menu
          e.preventDefault();
          e.stopPropagation();
          navigate(e.key === 'ArrowDown' ? 1 : -1);
          stateRef.current.menuRef?.current?.focus();
          break;
        }

        case 'Enter': {
          const { onPendingCommit: commit } = stateRef.current;
          if (pendingIdsRef.current.size > 0) {
            e.preventDefault();
            e.stopPropagation();
            pendingIdsRef.current.forEach(id => {
              const item = list.find(i => i.id === id);
              if (item && !item.disabled) select(item);
            });
            setPendingIds(new Set());
            queueMicrotask(() => commit?.());
          } else if (activeIndexRef.current >= 0) {
            e.preventDefault();
            e.stopPropagation();
            const item = list[activeIndexRef.current];
            if (item && !item.disabled) select(item);
          }
          // No pending items and no active selection — let event propagate
          // (e.g. segment input handles Enter for custom value commit)
          break;
        }

        case 'ArrowRight': {
          if (!arrowRight) break;
          e.preventDefault();
          e.stopPropagation();
          const { arrowRightSelectsActive: selectsActive } = stateRef.current;
          if (pendingIdsRef.current.size > 0) {
            pendingIdsRef.current.forEach(id => {
              const item = list.find(i => i.id === id);
              if (item && !item.disabled) select(item);
            });
            setPendingIds(new Set());
            queueMicrotask(() => arrowRight());
          } else if (selectsActive && activeIndexRef.current >= 0) {
            const item = list[activeIndexRef.current];
            if (item && !item.disabled) select(item);
          } else {
            arrowRight();
          }
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

  // Sync mouse hover / Ark UI keyboard nav with our state + scroll into view
  const onHighlightChange = useCallback((details: { highlightedValue: string | null }) => {
    if (!details.highlightedValue) return;
    // During multi-select (Cmd+Arrow), ignore external highlight changes from Ark UI
    // — our navigate() already set the correct activeIndex
    if (suppressHighlightRef.current) return;
    const idx = stateRef.current.items.findIndex(item => item.id === details.highlightedValue);
    if (idx >= 0) {
      setActiveIndex(idx);
      activeIndexRef.current = idx;
    }
    // Scroll highlighted item into view
    const container = stateRef.current.menuRef?.current;
    const el = container?.querySelector<HTMLElement>(
      `[role="menuitem"][data-value="${CSS.escape(details.highlightedValue)}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, []);

  // Empty string (not null) so DropdownMenu always passes it to Ark UI,
  // preventing Ark's default auto-highlight of the first item when focus is elsewhere.
  const highlightedValue = items[activeIndex]?.id ?? '';

  return { activeIndex, setActiveIndex, highlightedValue, onHighlightChange, pendingIds };
};
