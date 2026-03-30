import type { RefObject } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { ChipSegment } from '../../FilterInputField/FilterInputChip';
import { chipIdToConditionIndex, getOperatorFromLabel } from '../../lib';
import type {
  Condition,
  FieldMetadata,
  FilterInputChipData,
  FilterOperator,
  MenuState,
} from '../../types';

interface UseChipEditingOptions {
  conditions: Condition[];
  chips: FilterInputChipData[];
  fields: FieldMetadata[];
  containerRef: RefObject<HTMLElement | null>;
  setMenuOffset: (offset: number) => void;
  setSelectedField: (field: FieldMetadata | null) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setMenuState: (state: MenuState) => void;
  upsertCondition: (
    field: FieldMetadata,
    operator: FilterOperator | undefined,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
  ) => void;
}

// ── Pure helpers ────────────────────────────────────────────

/** Resolve chip ID → Condition */
const getConditionByChipId = (chipId: string, conditions: Condition[]): Condition | null => {
  const idx = chipIdToConditionIndex(chipId);
  return idx !== null ? (conditions[idx] ?? null) : null;
};

const SEGMENT_TO_MENU: Record<ChipSegment, MenuState> = {
  attribute: 'field',
  operator: 'operator',
  value: 'value',
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
  if (!field || condition.error === 'attribute') return 'attribute';
  if (!condition.operator) return 'operator';
  if (condition.value === null || condition.value === '' || condition.error === 'value')
    return 'value';
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
  containerRef,
  setMenuOffset,
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

  /** Handle chip segment click — receives pre-computed segment and anchorRect from FilterInputChip */
  const handleChipClick = useCallback(
    (chipId: string, segment: ChipSegment, anchorRect: DOMRect) => {
      const condition = getConditionByChipId(chipId, conditionsRef.current);
      if (!condition) return;

      const field = fieldsRef.current.find(f => f.name === condition.field);

      const chip = chipsRef.current.find(c => c.id === chipId);
      if (!chip || chip.variant !== 'chip') return;

      // If chip is incomplete/errored, redirect to the first missing segment
      const incompleteSegment = condition.error
        ? getFirstIncompleteSegment(condition, fieldsRef.current)
        : null;
      const targetSegment = incompleteSegment ?? segment;

      // For unknown fields, only attribute editing is allowed
      if (!field && targetSegment !== 'attribute') return;

      // Clear error when resuming editing of an incomplete chip
      if (incompleteSegment && field) {
        upsertCondition(field, condition.operator, condition.value, chipId);
      }

      const containerRect = containerRef.current?.getBoundingClientRect();
      setMenuOffset(containerRect ? anchorRect.left - containerRect.left : 0);
      setEditingChipId(chipId);
      setSelectedField(field ?? null);

      const rawOperator =
        targetSegment === 'value' || targetSegment === 'operator'
          ? (getOperatorFromLabel(chip.operator || '', field?.type ?? 'string') ??
            condition.operator)
          : null;

      if (targetSegment === 'value') {
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
    [containerRef, setMenuOffset, setSelectedField, setSelectedOperator, setMenuState, upsertCondition],
  );

  /** Reset segment-level editing state (shared by clearEditing and cancelSegmentEdit) */
  const resetSegmentState = useCallback(() => {
    setEditingSegment(null);
    setSegmentFilterText('');
    setUserHasTyped(false);
  }, []);

  const clearEditing = useCallback(() => {
    setEditingChipId(null);
    resetSegmentState();
  }, [resetSegmentState]);

  const cancelSegmentEdit = useCallback(() => {
    resetSegmentState();
    setMenuState('closed');
  }, [resetSegmentState, setMenuState]);

  /** Wraps setSegmentFilterText to track user typing */
  const handleSegmentFilterChange = useCallback((text: string) => {
    setSegmentFilterText(text);
    setUserHasTyped(true);
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
      handleChipClick,
      clearEditing,
      cancelSegmentEdit,
    }),
    [
      editingChipId,
      editingSegment,
      segmentDisplayText,
      segmentMenuFilterText,
      handleSegmentFilterChange,
      handleChipClick,
      clearEditing,
      cancelSegmentEdit,
    ],
  );
};
