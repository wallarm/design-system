import type { FocusEvent, RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { type ChipSegment, SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { isMenuRelated, nextBuildingMenu } from '../../lib';
import type { FieldMetadata, FilterOperator, MenuState } from '../../types';

interface UseFocusManagementDeps {
  menuState: MenuState;
  isFocused: boolean;
  conditionsLength: number;
  inputText: string;
  /** In-progress building-chip state — refocus resumes at next missing segment. */
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  containerRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  editingSegment: ChipSegment | null;
  /** Direct ref to the attribute segment input when editing. */
  segmentAttributeInputRef: RefObject<HTMLInputElement | null>;
  /** Direct ref to the operator segment input when editing. */
  segmentOperatorInputRef: RefObject<HTMLInputElement | null>;
  /** Direct ref to the value segment input when editing. */
  segmentValueInputRef: RefObject<HTMLInputElement | null>;
  /** Set by FilterInputValueMenu — commits multi-select checked values on blur. */
  blurCommitRef: RefObject<(() => boolean) | null>;
  /** Commits a building chip's freeform value on blur. Returns true if committed. */
  commitBuildingOnBlur: () => boolean;
  /** In-progress building chip exists — blur/close must preserve it (skip resetState). */
  hasIncompleteBuilding: () => boolean;
  setIsFocused: (focused: boolean) => void;
  setMenuState: (state: MenuState) => void;
  resetMenuAnchor: () => void;
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
  resetMenuAnchor,
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

  // Re-entry guard: handleBlur's resetState→refocus→explicit-blur loop would
  // recursively re-fire blur and overflow the stack. AS-882.
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
        // Try multi-select commit, then freeform building commit. If neither
        // fires and a building chip is incomplete, preserve it (blur shouldn't
        // destroy in-progress work) but force-close the menu in case Ark UI's
        // outside-click handler bailed out.
        const committed = blurCommitRef.current?.() || commitBuildingOnBlur();
        if (!committed) {
          if (hasIncompleteBuilding()) {
            setMenuState('closed');
          } else {
            resetState();
          }
        }
        // commit chain above may have refocused our input; honor user blur
        // intent by restoring focus to where they clicked (or blurring if it
        // was non-focusable). AS-882.
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

  // Auto-open menu on focus: resume a building chip at its next missing
  // segment, or open the field menu when input is empty. Skipped during
  // segment inline-edit — segment click already opened the right menu.
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
      resetMenuAnchor();
      setMenuState(nextBuildingMenu(selectedField, selectedOperator)!);
    } else if (conditionsLength === 0 && inputText === '') {
      resetMenuAnchor();
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
    resetMenuAnchor,
    setMenuState,
  ]);

  // Prevent Ark UI focus steal on menu open: zag.js Menu redirects focus via
  // single rAF on mount; double rAF runs after that redirect. Fragile — breaks
  // if Ark UI changes its focus timing.
  useEffect(() => {
    if (menuState === 'closed') return;
    if (!isFocused) return;

    let outerRaf = 0;
    let innerRaf = 0;
    outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        // Re-check focus at exec time — user may have clicked outside while
        // rAFs were queued; don't recapture in that case. AS-882.
        const container = containerRef.current;
        if (!container) return;
        const active = document.activeElement as HTMLElement | null;
        // Body-focus policy: here body means "user clicked outside" — do NOT
        // recapture. useResetState applies the opposite policy (body = focus
        // dropped after re-render, refocus). AS-882.
        if (active && !container.contains(active) && !isMenuRelated(active)) return;

        if (editingSegment) {
          // Redirect focus to the segment's inline input (refs attached by Segment.tsx).
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

  // Keep focus on chip input while pointer hovers menu items: zag.js fires
  // focusMenu on ITEM_POINTERMOVE, moving DOM focus into Menu.Content. For the
  // combobox pattern (focus on input, items highlighted via controlled
  // highlightedValue), redirect focus back. Listener is on `document` so it
  // survives menu unmount/remount; active menu resolved via DOM rather than
  // menuRef (shared across three menus, can be null mid-transition).
  // Guards: skip the date picker (its calendar owns focus) and deliberate
  // clicks on interactive controls.
  const segmentInputRefsMap = useMemo(
    () =>
      ({
        [SEGMENT_VARIANT.attribute]: segmentAttributeInputRef,
        [SEGMENT_VARIANT.operator]: segmentOperatorInputRef,
        [SEGMENT_VARIANT.value]: segmentValueInputRef,
      }) satisfies Record<ChipSegment, RefObject<HTMLInputElement | null>>,
    [segmentAttributeInputRef, segmentOperatorInputRef, segmentValueInputRef],
  );

  useEffect(() => {
    if (menuState === 'closed') return;
    if (!isFocused) return;

    const handleFocusIn = (e: globalThis.FocusEvent) => {
      const targetEl = e.target as HTMLElement | null;
      if (!targetEl) return;
      const menu = targetEl.closest('[data-filter-input-menu]') as HTMLElement | null;
      if (!menu) return;
      if (menu.querySelector('[data-scope="date-picker"]')) return;
      const tag = targetEl.tagName;
      if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const dest = editingSegment ? segmentInputRefsMap[editingSegment]?.current : inputRef.current;
      if (!dest) return;
      if (document.activeElement === dest) return;
      dest.focus({ preventScroll: true });
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [menuState, isFocused, editingSegment, inputRef, segmentInputRefsMap]);

  return { handleFocus, handleBlur };
};
