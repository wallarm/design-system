import type { RefObject } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { chipIdToConditionIndex, getOperatorFromLabel } from '../../lib';
import type { ChipSegment } from '../../QueryBarInput/QueryBarChip';
import type {
  Condition,
  FieldMetadata,
  FilterOperator,
  MenuState,
  QueryBarChipData,
} from '../../types';

interface UseChipEditingOptions {
  conditions: Condition[];
  chips: QueryBarChipData[];
  fields: FieldMetadata[];
  containerRef: RefObject<HTMLElement | null>;
  setMenuOffset: (offset: number) => void;
  setSelectedField: (field: FieldMetadata) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setMenuState: (state: MenuState) => void;
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
}: UseChipEditingOptions) => {
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const [editingSegment, setEditingSegment] = useState<ChipSegment | null>(null);
  const [segmentFilterText, setSegmentFilterText] = useState('');

  /** Handle chip segment click — receives pre-computed segment and anchorRect from QueryBarChip */
  const handleChipClick = useCallback(
    (chipId: string, segment: ChipSegment, anchorRect: DOMRect) => {
      const condition = getConditionByChipId(chipId, conditions);
      if (!condition) return;

      const field = fields.find(f => f.name === condition.field);
      // For unknown fields (error chips), allow attribute editing to pick a valid field
      if (!field && segment !== 'attribute') return;

      const chip = chips.find(c => c.id === chipId);
      if (!chip || chip.variant !== 'chip') return;

      const containerRect = containerRef.current?.getBoundingClientRect();
      setMenuOffset(containerRect ? anchorRect.left - containerRect.left : 0);
      setEditingChipId(chipId);
      setSelectedField(field ?? null);

      const rawOperator =
        segment === 'value' || segment === 'operator'
          ? (getOperatorFromLabel(chip.operator || '', field?.type ?? 'string') ?? condition.operator)
          : null;

      if (segment === 'value') {
        setSelectedOperator(rawOperator);
      } else {
        setSelectedOperator(null);
      }

      setEditingSegment(segment);
      // Show full dropdown (empty filter) when condition has an error
      const segmentText: Record<ChipSegment, string> = {
        attribute: chip.attribute ?? '',
        operator: chip.operator ?? '',
        value: chip.value ?? '',
      };
      setSegmentFilterText(condition.error ? '' : segmentText[segment]);

      setMenuState(SEGMENT_TO_MENU[segment]);
    },
    [
      conditions,
      fields,
      chips,
      containerRef,
      setMenuOffset,
      setSelectedField,
      setSelectedOperator,
      setMenuState,
    ],
  );

  const clearEditing = useCallback(() => {
    setEditingChipId(null);
    setEditingSegment(null);
    setSegmentFilterText('');
  }, []);

  const cancelSegmentEdit = useCallback(() => {
    setEditingSegment(null);
    setSegmentFilterText('');
    setMenuState('closed');
  }, [setMenuState]);

  return useMemo(
    () => ({
      editingChipId,
      editingSegment,
      segmentFilterText,
      setSegmentFilterText,
      handleChipClick,
      clearEditing,
      cancelSegmentEdit,
    }),
    [
      editingChipId,
      editingSegment,
      segmentFilterText,
      handleChipClick,
      clearEditing,
      cancelSegmentEdit,
    ],
  );
};
