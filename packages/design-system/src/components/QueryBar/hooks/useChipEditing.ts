import type { MouseEvent as ReactMouseEvent, RefObject } from 'react';
import { useState } from 'react';
import { chipIdToConditionIndex, getOperatorFromLabel, isMultiSelectOperator } from '../lib';
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
  toggleConnector: (connectorId: string) => void;
  setMenuOffset: (offset: number) => void;
  setSelectedField: (field: FieldMetadata) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setMultiSelectValues: (values: Array<string | number | boolean>) => void;
  setMenuState: (state: MenuState) => void;
}

// ── Pure helpers ────────────────────────────────────────────

/** Resolve chip ID → Condition */
const getConditionByChipId = (chipId: string, conditions: Condition[]): Condition | null => {
  const idx = chipIdToConditionIndex(chipId);
  return idx !== null ? conditions[idx] ?? null : null;
};

/** Determine which segment was clicked via data-slot */
type ClickedSegment = 'attribute' | 'operator' | 'value';

const getClickedSegment = (target: HTMLElement): ClickedSegment => {
  const slot = target.closest('[data-slot]')?.getAttribute('data-slot');
  if (slot === 'segment-attribute') return 'attribute';
  if (slot === 'segment-value') return 'value';
  return 'operator';
};

/** Calculate menu X offset relative to container */
const calcMenuOffset = (
  target: HTMLElement,
  segment: ClickedSegment,
  containerRef: RefObject<HTMLElement | null>,
): number => {
  const chipEl = target.closest('[data-slot="query-bar-chip"]') as HTMLElement | null;
  const segmentEl = target.closest('[data-slot]') as HTMLElement | null;
  const anchorEl = segment === 'attribute' ? chipEl : segmentEl;
  const containerRect = containerRef.current?.getBoundingClientRect();
  if (!containerRect || !anchorEl) return 0;
  return anchorEl.getBoundingClientRect().left - containerRect.left;
};

const SEGMENT_TO_MENU: Record<ClickedSegment, MenuState> = {
  attribute: 'field',
  operator: 'operator',
  value: 'value',
};

// ── Hook ───────────────────────────────────────────────────

/**
 * Manages editing of existing filter chips.
 * Handles chip click → determine segment → open appropriate menu.
 * Provides tryEditField/tryEditOperator for immediate commit when editing.
 */
export const useChipEditing = ({
  conditions,
  chips,
  fields,
  containerRef,
  upsertCondition,
  toggleConnector,
  setMenuOffset,
  setSelectedField,
  setSelectedOperator,
  setMultiSelectValues,
  setMenuState,
}: UseChipEditingOptions) => {
  const [editingChipId, setEditingChipId] = useState<string | null>(null);

  /** If editing, commits field change immediately. Returns true if handled. */
  const tryEditField = (field: FieldMetadata): boolean => {
    if (!editingChipId) return false;
    const condition = getConditionByChipId(editingChipId, conditions);
    if (!condition) return false;
    upsertCondition(field, condition.operator, condition.value, editingChipId);
    return true;
  };

  /** If editing, commits operator change immediately. Returns true if handled. */
  const tryEditOperator = (operator: FilterOperator, selectedField: FieldMetadata): boolean => {
    if (!editingChipId) return false;
    const condition = getConditionByChipId(editingChipId, conditions);
    if (!condition) return false;
    upsertCondition(selectedField, operator, condition.value, editingChipId);
    return true;
  };

  const handleChipClick = (chipId: string, e: ReactMouseEvent) => {
    if (chipId.startsWith('connector-')) {
      toggleConnector(chipId);
      return;
    }

    const condition = getConditionByChipId(chipId, conditions);
    if (!condition) return;

    const field = fields.find(f => f.name === condition.field);
    if (!field) return;

    const chip = chips.find(c => c.id === chipId);
    if (!chip || chip.variant !== 'chip') return;

    const target = e.target as HTMLElement;
    const segment = getClickedSegment(target);

    setMenuOffset(calcMenuOffset(target, segment, containerRef));
    setEditingChipId(chipId);
    setSelectedField(field);

    if (segment === 'value') {
      const rawOperator = getOperatorFromLabel(chip.operator || '', field.type);
      setSelectedOperator(rawOperator);
      if (rawOperator && isMultiSelectOperator(rawOperator) && Array.isArray(condition.value)) {
        setMultiSelectValues(condition.value);
      }
    } else {
      setSelectedOperator(null);
    }

    setMenuState(SEGMENT_TO_MENU[segment]);
  };

  const clearEditing = () => setEditingChipId(null);

  return {
    editingChipId,
    handleChipClick,
    tryEditField,
    tryEditOperator,
    clearEditing,
  };
};
