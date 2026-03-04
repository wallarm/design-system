import type { MouseEvent as ReactMouseEvent } from 'react';
import type { RefObject } from 'react';
import { useState } from 'react';
import { getOperatorFromLabel, isMultiSelectOperator } from '../lib';
import type { Condition, FieldMetadata, FilterChipData, FilterOperator } from '../types';

type MenuState = 'closed' | 'field' | 'operator' | 'value';

interface UseChipEditingOptions {
  conditions: Condition[];
  chips: FilterChipData[];
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

  const getEditingCondition = (): Condition | null => {
    if (!editingChipId) return null;
    const match = editingChipId.match(/^chip-(\d+)$/);
    const idx = match ? Number(match[1]) : null;
    if (idx === null) return null;
    return conditions[idx] ?? null;
  };

  /**
   * Called from handleFieldSelect — if editing, commits the field change immediately.
   * Returns true if handled (editing mode), false if normal flow should continue.
   */
  const tryEditField = (field: FieldMetadata): boolean => {
    if (!editingChipId) return false;
    const condition = getEditingCondition();
    if (!condition) return false;
    upsertCondition(field, condition.operator, condition.value, editingChipId);
    return true;
  };

  /**
   * Called from handleOperatorSelect — if editing, commits the operator change immediately.
   * Returns true if handled (editing mode), false if normal flow should continue.
   */
  const tryEditOperator = (operator: FilterOperator, selectedField: FieldMetadata): boolean => {
    if (!editingChipId) return false;
    const condition = getEditingCondition();
    if (!condition) return false;
    upsertCondition(selectedField, operator, condition.value, editingChipId);
    return true;
  };

  const handleChipClick = (chipId: string, e: ReactMouseEvent) => {
    if (chipId.startsWith('connector-')) {
      toggleConnector(chipId);
      return;
    }

    const match = chipId.match(/^chip-(\d+)$/);
    const idx = match ? Number(match[1]) : null;
    if (idx === null) return;

    const condition = conditions[idx];
    if (!condition) return;

    const field = fields.find(f => f.name === condition.field);
    if (!field) return;

    const chip = chips.find(c => c.id === chipId);
    if (!chip || chip.variant !== 'chip') return;

    const target = e.target as HTMLElement;
    const segmentEl = target.closest('[data-slot]') as HTMLElement | null;
    const slot = segmentEl?.getAttribute('data-slot');

    // For attribute, anchor at the chip start; for operator/value, anchor at the segment
    const chipEl = target.closest('[data-slot="filter-chip"]') as HTMLElement | null;
    const anchorEl = slot === 'segment-attribute' ? chipEl : segmentEl;
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect && anchorEl) {
      setMenuOffset(anchorEl.getBoundingClientRect().left - containerRect.left);
    } else {
      setMenuOffset(0);
    }

    setEditingChipId(chipId);
    setSelectedField(field);

    if (slot === 'segment-attribute') {
      setSelectedOperator(null);
      setMenuState('field');
    } else if (slot === 'segment-value') {
      const rawOperator = getOperatorFromLabel(chip.operator || '', field.type);
      setSelectedOperator(rawOperator);

      // Pre-populate selected values for multi-select operators
      if (rawOperator && isMultiSelectOperator(rawOperator) && Array.isArray(condition.value)) {
        setMultiSelectValues(condition.value);
      }

      setMenuState('value');
    } else {
      setSelectedOperator(null);
      setMenuState('operator');
    }
  };

  const clearEditing = () => {
    setEditingChipId(null);
  };

  return {
    editingChipId,
    handleChipClick,
    tryEditField,
    tryEditOperator,
    clearEditing,
  };
};
