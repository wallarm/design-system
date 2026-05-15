import type { FocusEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { type ChipSegment, SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { isMenuRelated, nextBuildingMenu } from '../../lib';
import type { FieldMetadata, FilterOperator, MenuState } from '../../types';

interface UseFocusManagementDeps {
  menuState: MenuState;
  isFocused: boolean;
  conditionsLength: number;
  inputText: string;
  /** In-progress building-chip state — needed so refocus resumes at the next
   *  missing segment instead of (incorrectly) reopening the field menu. */
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  containerRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  editingSegment: ChipSegment | null;
  /** Direct ref to the attribute segment <input> when editing — avoids querySelector. */
  segmentAttributeInputRef: RefObject<HTMLInputElement | null>;
  /** Direct ref to the operator segment <input> when editing — avoids querySelector. */
  segmentOperatorInputRef: RefObject<HTMLInputElement | null>;
  /** Direct ref to the value segment <input> when editing — avoids querySelector. */
  segmentValueInputRef: RefObject<HTMLInputElement | null>;
  /** Ref set by FilterInputValueMenu — calls commitChecked() for multi-select before blur reset. Returns true if committed. */
  blurCommitRef: RefObject<(() => boolean) | null>;
  /** Tries to commit a building chip's freeform value on blur. Returns true if committed. */
  commitBuildingOnBlur: () => boolean;
  /** True if there's an in-progress building chip that the blur/close path
   *  must preserve (skip resetState). */
  hasIncompleteBuilding: () => boolean;
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
  selectedField,
  selectedOperator,
  containerRef,
  inputRef,
  editingSegment,
  segmentAttributeInputRef,
  segmentOperatorInputRef,
  segmentValueInputRef,
  blurCommitRef,
  commitBuildingOnBlur,
  hasIncompleteBuilding,
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

  // Re-entry guard: handleBlur calls resetState (which may refocus the input)
  // and then explicitly blurs to honor outside-click intent. That synchronous
  // blur fires another blur event → handleBlur again → resetState refocuses →
  // explicit blur → infinite recursion → stack overflow. The guard short-circuits
  // the recursive entry. AS-882.
  const handlingBlurRef = useRef(false);

  const handleBlur = useCallback(
    (e: FocusEvent) => {
      if (handlingBlurRef.current) return;
      const related = e.relatedTarget as HTMLElement | null;
      if (containerRef.current?.contains(related)) return;
      if (isMenuRelated(related)) return;
      handlingBlurRef.current = true;
      try {
        setIsFocused(false);
        // Try to commit pending values before resetting state:
        // 1. Multi-select checked values (via FilterInputValueMenu ref)
        // 2. Building chip with freeform typed value (commit only when complete)
        // If neither committed AND there's an incomplete building chip alive,
        // preserve it — blur should not destroy in-progress work.
        const committed = blurCommitRef.current?.() || commitBuildingOnBlur();
        if (!committed) {
          if (hasIncompleteBuilding()) {
            // Preserve in-progress building chip, but always close any
            // dropdown — the menu may have leaked open if Ark UI's outside-
            // click handler bailed out (e.g. activeElement was still the
            // input). A consistent closed menu lets the refocus path
            // re-open at the right segment.
            setMenuState('closed');
          } else {
            resetState();
          }
        }
        // resetState / commit chain above may have refocused our input via
        // inputRef.current?.focus() in several sub-paths (value commit, clear,
        // etc.). Honor the user's blur intent by restoring focus to where they
        // actually clicked, or explicitly blurring if they clicked somewhere
        // non-focusable (null relatedTarget / plain div / body). AS-882.
        related?.focus();
        if (document.activeElement === inputRef.current) {
          inputRef.current?.blur();
        }
      } finally {
        handlingBlurRef.current = false;
      }
    },
    [
      containerRef,
      blurCommitRef,
      commitBuildingOnBlur,
      hasIncompleteBuilding,
      resetState,
      setIsFocused,
      setMenuState,
      inputRef,
    ],
  );

  // ── Auto-open menu on focus ───────────────────────────────
  //
  // Two cases:
  //   1. Resume a building chip — when focus returns and a building chip is
  //      mid-progress (selectedField set, not editing a committed chip),
  //      reopen the menu for the first missing segment (operator if no
  //      operator chosen yet, otherwise value).
  //   2. Empty initial focus — when there's nothing to resume and the input
  //      is empty + no chips exist, open the field menu so the user can
  //      start building.
  //
  // Skip entirely while a segment inline-edit is active — the segment click
  // handler has already opened the segment-specific menu, and we must not
  // overwrite it on the focus tick that fired the same gesture.

  const prevFocusedRef = useRef(false);
  useEffect(() => {
    if (!isFocused || prevFocusedRef.current) {
      prevFocusedRef.current = isFocused;
      return;
    }
    if (editingSegment) {
      prevFocusedRef.current = isFocused;
      return;
    }
    if (selectedField) {
      resetMenuOffset();
      setMenuState(nextBuildingMenu(selectedField, selectedOperator)!);
    } else if (conditionsLength === 0 && inputText === '') {
      resetMenuOffset();
      setMenuState('field');
    }
    prevFocusedRef.current = isFocused;
  }, [
    isFocused,
    conditionsLength,
    inputText,
    selectedField,
    selectedOperator,
    editingSegment,
    resetMenuOffset,
    setMenuState,
  ]);

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
        // Body-focus policy: HERE body means "user clicked outside" (e.g. tenant
        // switcher, a non-focusable region of the page) — DO NOT recapture.
        // The opposite policy lives in useResetState, which treats body-focus as
        // "DOM just re-rendered, focus dropped" and refocuses. See the long
        // comment on useResetState for the full reasoning. AS-882.
        if (active && !container.contains(active) && !isMenuRelated(active)) return;

        if (editingSegment) {
          // Redirect focus to the segment's inline input via the registry, beating
          // Ark UI's focus steal. Refs are attached by Segment.tsx for every variant.
          const segmentInputRefs: Record<ChipSegment, RefObject<HTMLInputElement | null>> = {
            [SEGMENT_VARIANT.attribute]: segmentAttributeInputRef,
            [SEGMENT_VARIANT.operator]: segmentOperatorInputRef,
            [SEGMENT_VARIANT.value]: segmentValueInputRef,
          };
          const segmentInput = segmentInputRefs[editingSegment]?.current ?? null;
          if (segmentInput && document.activeElement !== segmentInput) {
            segmentInput.focus();
            segmentInput.select();
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
  }, [
    menuState,
    isFocused,
    inputRef,
    editingSegment,
    containerRef,
    segmentAttributeInputRef,
    segmentOperatorInputRef,
    segmentValueInputRef,
  ]);

  return { handleFocus, handleBlur };
};
