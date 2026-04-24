import type { FocusEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { isMenuRelated } from '../../lib';
import type { ChipSegment } from '../../FilterInputField/FilterInputChip';
import type { MenuState } from '../../types';

interface UseFocusManagementDeps {
  menuState: MenuState;
  isFocused: boolean;
  conditionsLength: number;
  inputText: string;
  containerRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  editingSegment: ChipSegment | null;
  /** Direct ref to the attribute segment <input> when editing — avoids querySelector. */
  segmentAttributeInputRef: RefObject<HTMLInputElement | null>;
  /** Direct ref to the value segment <input> when editing — avoids querySelector. */
  segmentValueInputRef: RefObject<HTMLInputElement | null>;
  /** Ref set by FilterInputValueMenu — calls commitChecked() for multi-select before blur reset. Returns true if committed. */
  blurCommitRef: RefObject<(() => boolean) | null>;
  /** Tries to commit a building chip's freeform value on blur. Returns true if committed. */
  commitBuildingOnBlur: () => boolean;
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
  segmentAttributeInputRef,
  segmentValueInputRef,
  blurCommitRef,
  commitBuildingOnBlur,
  setIsFocused,
  setMenuState,
  resetMenuOffset,
  resetState,
}: UseFocusManagementDeps) => {
  const handleFocus = useCallback(
    (e: FocusEvent) => {
      // Ignore focus from connector chip — its DropdownMenu manages its own focus
      if ((e.target as HTMLElement)?.closest?.('[data-slot="filter-input-connector-chip"]')) return;
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
      // Try to commit pending values before resetting state:
      // 1. Multi-select checked values (via FilterInputValueMenu ref)
      // 2. Building chip with freeform typed value
      const committed = blurCommitRef.current?.() || commitBuildingOnBlur();
      if (!committed) resetState();
      // resetState / commit chain above may have refocused our input via
      // inputRef.current?.focus() in several sub-paths (value commit, clear,
      // etc.). Honor the user's blur intent by restoring focus to where they
      // actually clicked, or explicitly blurring if they clicked somewhere
      // non-focusable (null relatedTarget / plain div / body). AS-882.
      related?.focus();
      if (document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    },
    [containerRef, blurCommitRef, commitBuildingOnBlur, resetState, setIsFocused, inputRef],
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
    if (!isFocused) return;

    let outerRaf = 0;
    let innerRaf = 0;
    outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        // Re-check at execution time: focus may have moved outside the component
        // while rAFs were queued (e.g. user clicked a tenant switcher). Don't
        // recapture in that case — AS-882.
        const container = containerRef.current;
        if (!container) return;
        const active = document.activeElement as HTMLElement | null;
        // body-focus policy: here, body means the user moved focus outside —
        // don't recapture. Contrast with resetState in useFilterInputAutocomplete,
        // which treats body-focus as "stayed inside" (DOM just re-rendered).
        if (active && !container.contains(active) && !isMenuRelated(active)) return;

        if (editingSegment) {
          // Redirect focus to the segment input via ref, beating Ark UI's focus steal.
          // segmentAttributeInputRef / segmentValueInputRef are attached by Segment.tsx.
          const segmentInput =
            editingSegment === 'attribute'
              ? segmentAttributeInputRef.current
              : editingSegment === 'value'
                ? segmentValueInputRef.current
                : null;
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
  }, [menuState, isFocused, inputRef, editingSegment, containerRef, segmentAttributeInputRef, segmentValueInputRef]);

  return { handleFocus, handleBlur };
};
