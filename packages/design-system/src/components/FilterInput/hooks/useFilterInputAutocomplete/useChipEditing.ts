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

/** Resolve chip ID → Condition */
const getConditionByChipId = (chipId: string, conditions: Condition[]): Condition | null => {
  const idx = chipIdToConditionIndex(chipId);
  return idx !== null ? (conditions[idx] ?? null) : null;
};

/**
 * Returns the first incomplete/errored segment to resume building, or null
 * if the chip is complete (attribute → operator → value).
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

/**
 * Manages editing of existing filter chips. Chip click opens the appropriate
 * menu based on segment, then advances through field → operator → value.
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
  // Suppresses filtering until first keystroke after edit opens.
  const [userHasTyped, setUserHasTyped] = useState(false);

  // Refs keep data fresh in callbacks without recreating them.
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

      // Errored chips redirect to the first missing segment.
      const incompleteSegment = condition.error
        ? getFirstIncompleteSegment(condition, fieldsRef.current)
        : null;
      // No-value operator's placeholder value segment reroutes to operator
      // (user most likely wants to switch to a value-bearing operator).
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
   * Enter inline-edit on a building chip segment. The (chipId null, segment
   * set) pair is the building-edit marker downstream consumers branch on.
   */
  const startBuildingEdit = useCallback((segment: ChipSegment, currentText: string) => {
    // Pin chipId to null explicitly — the marker is load-bearing downstream.
    setEditingChipId(null);
    setEditingSegment(segment);
    setSegmentFilterText(currentText);
    setUserHasTyped(false);
  }, []);

  /**
   * Switch inline-edit to a different segment of the *same* committed chip.
   * For building-chip switches use `startBuildingEdit` (clears editingChipId).
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

  /** Resets userHasTyped so the dropdown widens back to all options while
   *  segment text stays visible — used by multi-select to prevent flicker. */
  const resetSegmentTyping = useCallback(() => {
    setUserHasTyped(false);
  }, []);

  const segmentDisplayText = segmentFilterText;
  // Dropdown filter text — empty until user types.
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
