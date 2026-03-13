import type { FocusEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { isMenuRelated } from '../../lib';
import type { MenuState } from '../../types';

interface UseFocusManagementDeps {
  menuState: MenuState;
  isFocused: boolean;
  conditionsLength: number;
  inputText: string;
  containerRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  editingSegment: string | null;
  /** Ref set by QueryBarValueMenu — calls commitChecked() for multi-select before blur reset. Returns true if committed. */
  blurCommitRef: RefObject<(() => boolean) | null>;
  setIsFocused: (focused: boolean) => void;
  setMenuState: (state: MenuState) => void;
  resetMenuOffset: () => void;
  resetState: (continueBuilding?: boolean) => void;
}

export const useFocusManagement = ({
  menuState,
  isFocused,
  conditionsLength,
  inputText,
  containerRef,
  inputRef,
  editingSegment,
  blurCommitRef,
  setIsFocused,
  setMenuState,
  resetMenuOffset,
  resetState,
}: UseFocusManagementDeps) => {
  const handleFocus = useCallback(
    (e: FocusEvent) => {
      // Ignore focus from connector chip — its DropdownMenu manages its own focus
      if ((e.target as HTMLElement)?.closest?.('[data-slot="query-bar-connector-chip"]')) return;
      setIsFocused(true);
    },
    [setIsFocused],
  );

  const handleBlur = useCallback(
    (e: FocusEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (containerRef.current?.contains(related)) return;
      if (isMenuRelated(related)) return;
      setIsFocused(false);
      // Commit pending multi-select values before resetting state.
      // handleMultiCommit calls resetState internally, so skip the extra reset if committed.
      const committed = blurCommitRef.current?.();
      if (!committed) resetState();
    },
    [containerRef, blurCommitRef, resetState, setIsFocused],
  );

  // ── Auto-open field menu on initial focus when empty ──────

  const prevFocusedRef = useRef(false);
  useEffect(() => {
    if (isFocused && !prevFocusedRef.current && conditionsLength === 0 && inputText === '') {
      resetMenuOffset();
      setMenuState('field');
    }
    prevFocusedRef.current = isFocused;
  }, [isFocused, conditionsLength, inputText, resetMenuOffset, setMenuState]);

  // ── Prevent Ark UI focus steal on menu open ──────────────
  // Ark UI Menu (zag.js) steals focus via single rAF when a menu mounts.
  // Double rAF beats this by executing after zag's focus redirect.
  // ⚠️ Fragile: if Ark UI changes its focus timing, this workaround may break.
  // After redirect, ArrowDown can freely move focus to the menu.

  useEffect(() => {
    if (menuState === 'closed') return;

    let outerRaf = 0;
    let innerRaf = 0;
    outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        if (editingSegment) {
          // Redirect focus to the segment input, beating Ark UI's focus steal
          const segmentInput = containerRef.current?.querySelector<HTMLInputElement>(
            `[data-slot="segment-${editingSegment}"] input`,
          );
          if (segmentInput && document.activeElement !== segmentInput) {
            segmentInput.focus();
            segmentInput.select();
          } else if (!segmentInput && document.activeElement !== inputRef.current) {
            // Segment has no inline input (e.g., operator) — focus main input
            inputRef.current?.focus();
          }
        } else if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      });
    });
    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
    };
  }, [menuState, inputRef, editingSegment, containerRef]);

  return { handleFocus, handleBlur };
};
