import type { MouseEvent as ReactMouseEvent } from 'react';
import type { RefObject } from 'react';
import { useState } from 'react';
import { getOperatorFromLabel } from '../lib';
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
  toggleConnector: () => void;
  setMenuOffset: (offset: number) => void;
  setSelectedField: (field: FieldMetadata) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
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
      toggleConnector();
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

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect && segmentEl) {
      setMenuOffset(segmentEl.getBoundingClientRect().left - containerRect.left);
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
