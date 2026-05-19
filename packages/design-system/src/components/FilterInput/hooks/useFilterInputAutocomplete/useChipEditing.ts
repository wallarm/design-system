import { useCallback, useMemo, useRef, useState } from 'react';
import { type ChipSegment, SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import {
  chipIdToConditionIndex,
  getOperatorFromLabel,
  isNoValueOperator,
  SEGMENT_TO_MENU,
} from '../../lib';
import type {
  Condition,
  FieldMetadata,
  FilterInputChipData,
  FilterOperator,
  MenuState,
  UpsertCondition,
} from '../../types';

interface UseChipEditingOptions {
  conditions: Condition[];
  chips: FilterInputChipData[];
  fields: FieldMetadata[];
  setMenuAnchor: (el: HTMLElement | null) => void;
  setSelectedField: (field: FieldMetadata | null) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setMenuState: (state: MenuState) => void;
  upsertCondition: UpsertCondition;
}

// ── Pure helpers ────────────────────────────────────────────

/** Resolve chip ID → Condition */
const getConditionByChipId = (chipId: string, conditions: Condition[]): Condition | null => {
  const idx = chipIdToConditionIndex(chipId);
  return idx !== null ? (conditions[idx] ?? null) : null;
};

/**
 * Determine the first incomplete or errored segment of a chip (attribute → operator → value).
 * Returns the segment to resume building, or null if the chip is complete.
 */
const getFirstIncompleteSegment = (
  condition: Condition,
  fields: FieldMetadata[],
): ChipSegment | null => {
  const field = fields.find(f => f.name === condition.field);
  if (!field || condition.error === SEGMENT_VARIANT.attribute) return SEGMENT_VARIANT.attribute;
  if (!condition.operator) return SEGMENT_VARIANT.operator;
  if (
    condition.value === null ||
    condition.value === '' ||
    condition.error === SEGMENT_VARIANT.value
  )
    return SEGMENT_VARIANT.value;
  return null;
};

// ── Hook ───────────────────────────────────────────────────

/**
 * Manages editing of existing filter chips.
 * Handles chip click → open appropriate menu based on segment,
 * then advances through the full flow (field → operator → value).
 */
export const useChipEditing = ({
  conditions,
  chips,
  fields,
  setMenuAnchor,
  setSelectedField,
  setSelectedOperator,
  setMenuState,
  upsertCondition,
}: UseChipEditingOptions) => {
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const [editingSegment, setEditingSegment] = useState<ChipSegment | null>(null);
  const [segmentFilterText, setSegmentFilterText] = useState('');
  // Tracks whether user has typed since opening edit — suppresses filtering until first keystroke
  const [userHasTyped, setUserHasTyped] = useState(false);

  // Refs keep data fresh for callbacks without causing callback recreation
  const conditionsRef = useRef(conditions);
  conditionsRef.current = conditions;
  const chipsRef = useRef(chips);
  chipsRef.current = chips;
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;

  /** Handle chip segment click — receives pre-computed segment and anchor element from FilterInputChip */
  const handleChipClick = useCallback(
    (chipId: string, segment: ChipSegment, anchorEl: HTMLElement) => {
      const condition = getConditionByChipId(chipId, conditionsRef.current);
      if (!condition) return;

      const field = fieldsRef.current.find(f => f.name === condition.field);

      const chip = chipsRef.current.find(c => c.id === chipId);
      if (!chip || chip.variant !== 'chip') return;

      // If chip is incomplete/errored, redirect to the first missing segment
      const incompleteSegment = condition.error
        ? getFirstIncompleteSegment(condition, fieldsRef.current)
        : null;
      // No-value operator chips have a placeholder value segment — clicking
      // it has no real meaning, so reroute to the operator segment (the user
      // most likely wants to switch to a value-bearing operator).
      const isPlaceholderValueClick =
        segment === SEGMENT_VARIANT.value &&
        condition.operator != null &&
        isNoValueOperator(condition.operator);
      const targetSegment =
        incompleteSegment ?? (isPlaceholderValueClick ? SEGMENT_VARIANT.operator : segment);

      // For unknown fields, only attribute editing is allowed
      if (!field && targetSegment !== SEGMENT_VARIANT.attribute) return;

      // Clear error when resuming editing of an incomplete chip
      if (incompleteSegment && field) {
        upsertCondition(field, condition.operator, condition.value, chipId);
      }

      setMenuAnchor(anchorEl);
      setEditingChipId(chipId);
      setSelectedField(field ?? null);

      const rawOperator =
        targetSegment === SEGMENT_VARIANT.value || targetSegment === SEGMENT_VARIANT.operator
          ? (getOperatorFromLabel(chip.operator || '', field?.type ?? 'string') ??
            condition.operator)
          : null;

      if (targetSegment === SEGMENT_VARIANT.value) {
        setSelectedOperator(rawOperator ?? null);
      } else {
        setSelectedOperator(null);
      }

      setEditingSegment(targetSegment);
      const segmentText: Record<ChipSegment, string> = {
        attribute: chip.attribute ?? '',
        operator: chip.operator ?? '',
        value: chip.value ?? '',
      };
      setSegmentFilterText(segmentText[targetSegment]);
      setUserHasTyped(false);

      setMenuState(SEGMENT_TO_MENU[targetSegment]);
    },
    [setMenuAnchor, setSelectedField, setSelectedOperator, setMenuState, upsertCondition],
  );

  const clearEditing = useCallback(() => {
    setEditingChipId(null);
    setEditingSegment(null);
    setSegmentFilterText('');
    setUserHasTyped(false);
  }, []);

  /**
   * Enter inline-edit on a *building* chip segment. Unlike `handleChipClick`
   * there is no committed chip yet, so `editingChipId` stays null — that
   * combination (segment set, chipId null) is the building-edit marker
   * downstream consumers can branch on.
   */
  const startBuildingEdit = useCallback((segment: ChipSegment, currentText: string) => {
    // Defensive reset: editingChipId should already be null in the building
    // flow, but the marker (chipId null, segment set) is load-bearing for
    // downstream branching — pin it explicitly.
    setEditingChipId(null);
    setEditingSegment(segment);
    setSegmentFilterText(currentText);
    setUserHasTyped(false);
  }, []);

  /**
   * Switch the inline-edit target to a different segment of the *same*
   * committed chip — keeps editingChipId, resets the typed-flag so the
   * dropdown widens back to all options. For building-chip switches use
   * `startBuildingEdit` instead (which also clears editingChipId).
   */
  const switchEditSegment = useCallback((segment: ChipSegment, currentText: string) => {
    setEditingSegment(segment);
    setSegmentFilterText(currentText);
    setUserHasTyped(false);
  }, []);

  /** Wraps setSegmentFilterText to track user typing */
  const handleSegmentFilterChange = useCallback((text: string) => {
    setSegmentFilterText(text);
    setUserHasTyped(true);
  }, []);

  /** Resets only the "userHasTyped" flag so the dropdown filter widens back
   *  to all options, while the displayed segment text (the committed value
   *  the user is editing) stays visible on the chip. Used by multi-select
   *  toggle so the chip doesn't flicker to empty between clicks. */
  const resetSegmentTyping = useCallback(() => {
    setUserHasTyped(false);
  }, []);

  // Text shown in the inline input
  const segmentDisplayText = segmentFilterText;
  // Text used for dropdown filtering — empty until user types
  const segmentMenuFilterText = userHasTyped ? segmentFilterText : '';

  return useMemo(
    () => ({
      editingChipId,
      editingSegment,
      setEditingSegment,
      segmentFilterText: segmentDisplayText,
      segmentMenuFilterText,
      setSegmentFilterText: handleSegmentFilterChange,
      resetSegmentTyping,
      handleChipClick,
      startBuildingEdit,
      switchEditSegment,
      clearEditing,
    }),
    [
      editingChipId,
      editingSegment,
      segmentDisplayText,
      segmentMenuFilterText,
      handleSegmentFilterChange,
      resetSegmentTyping,
      handleChipClick,
      startBuildingEdit,
      switchEditSegment,
      clearEditing,
    ],
  );
};
