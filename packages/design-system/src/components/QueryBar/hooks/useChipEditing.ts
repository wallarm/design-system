import type { RefObject } from 'react';
import { useCallback, useState } from 'react';
import { chipIdToConditionIndex, getOperatorFromLabel } from '../lib';
import type { ChipSegment } from '../QueryBarChip/QueryBarChip';
import type { Condition, FieldMetadata, FilterOperator, MenuState, QueryBarChipData } from '../types';

interface UseChipEditingOptions {
  conditions: Condition[];
  chips: QueryBarChipData[];
  fields: FieldMetadata[];
  containerRef: RefObject<HTMLElement | null>;
  upsertCondition: (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
  ) => void;
  setMenuOffset: (offset: number) => void;
  setSelectedField: (field: FieldMetadata) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setMenuState: (state: MenuState) => void;
}

// ── Pure helpers ────────────────────────────────────────────

/** Resolve chip ID → Condition */
const getConditionByChipId = (chipId: string, conditions: Condition[]): Condition | null => {
  const idx = chipIdToConditionIndex(chipId);
  return idx !== null ? conditions[idx] ?? null : null;
};

const SEGMENT_TO_MENU: Record<ChipSegment, MenuState> = {
  attribute: 'field',
  operator: 'operator',
  value: 'value',
};

// ── Hook ───────────────────────────────────────────────────

/**
 * Manages editing of existing filter chips.
 * Handles chip click → open appropriate menu based on segment.
 * Provides tryEditField/tryEditOperator for immediate commit when editing.
 */
export const useChipEditing = ({
  conditions,
  chips,
  fields,
  containerRef,
  upsertCondition,
  setMenuOffset,
  setSelectedField,
  setSelectedOperator,
  setMenuState,
}: UseChipEditingOptions) => {
  const [editingChipId, setEditingChipId] = useState<string | null>(null);

  /** If editing, commits field change immediately. Returns true if handled. */
  const tryEditField = useCallback((field: FieldMetadata): boolean => {
    if (!editingChipId) return false;
    const condition = getConditionByChipId(editingChipId, conditions);
    if (!condition) return false;
    upsertCondition(field, condition.operator, condition.value, editingChipId);
    return true;
  }, [editingChipId, conditions, upsertCondition]);

  /** If editing, commits operator change immediately. Returns true if handled. */
  const tryEditOperator = useCallback((operator: FilterOperator, selectedField: FieldMetadata): boolean => {
    if (!editingChipId) return false;
    const condition = getConditionByChipId(editingChipId, conditions);
    if (!condition) return false;
    upsertCondition(selectedField, operator, condition.value, editingChipId);
    return true;
  }, [editingChipId, conditions, upsertCondition]);

  /** Handle chip segment click — receives pre-computed segment and anchorRect from QueryBarChip */
  const handleChipClick = useCallback((chipId: string, segment: ChipSegment, anchorRect: DOMRect) => {
    const condition = getConditionByChipId(chipId, conditions);
    if (!condition) return;

    const field = fields.find(f => f.name === condition.field);
    if (!field) return;

    const chip = chips.find(c => c.id === chipId);
    if (!chip || chip.variant !== 'chip') return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    setMenuOffset(containerRect ? anchorRect.left - containerRect.left : 0);
    setEditingChipId(chipId);
    setSelectedField(field);

    if (segment === 'value') {
      const rawOperator = getOperatorFromLabel(chip.operator || '', field.type);
      setSelectedOperator(rawOperator);
    } else {
      setSelectedOperator(null);
    }

    setMenuState(SEGMENT_TO_MENU[segment]);
  }, [conditions, fields, chips, containerRef, setMenuOffset, setSelectedField, setSelectedOperator, setMenuState]);

  const clearEditing = useCallback(() => setEditingChipId(null), []);

  return {
    editingChipId,
    handleChipClick,
    tryEditField,
    tryEditOperator,
    clearEditing,
  };
};
