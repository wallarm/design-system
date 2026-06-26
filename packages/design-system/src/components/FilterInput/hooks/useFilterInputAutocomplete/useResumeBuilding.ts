import type { RefObject } from 'react';
import { useCallback } from 'react';
import { chipIdToConditionIndex, isNoValueOperator } from '../../lib';
import type { Condition, FieldMetadata, FilterOperator, MenuState } from '../../types';
import type { BuildingBase } from './useAutocompleteState';

interface UseResumeBuildingDeps {
  conditions: Condition[];
  fields: FieldMetadata[];
  removeConditionAtIndex: (index: number) => void;
  setInsertIndex: (index: number | null) => void;
  setBuildingBase: (base: BuildingBase | null) => void;
  setBuildingSide: (side: 0 | 1) => void;
  setSelectedField: (field: FieldMetadata | null) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setBuildingMultiValue: (val: string | undefined) => void;
  setInputText: (text: string) => void;
  setMenuState: (state: MenuState) => void;
  resetMenuAnchor: () => void;
  /** Exit any inline-edit so the resumed flow is a clean building chip. */
  clearEditing: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

const isEmptyValue = (value: Condition['value'] | undefined): boolean =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * Resume building a committed-but-incomplete chip instead of inline-editing it.
 *
 * A chip left half-built (e.g. force-committed via an area click) keeps its
 * triplets but lacks a required value. Clicking it converts the committed
 * condition back into a building chip and reopens the menu at the first missing
 * step, so the normal building cascade carries on — including the paired
 * second triplet for two-step fields. This is what makes "press anywhere → red
 * chip → click to continue" work for paired fields (AS-1179).
 *
 * Returns a predicate: `true` when it took over (caller must not also run the
 * inline-edit handler), `false` when the chip is complete (edit it normally).
 */
export const useResumeBuilding = ({
  conditions,
  fields,
  removeConditionAtIndex,
  setInsertIndex,
  setBuildingBase,
  setBuildingSide,
  setSelectedField,
  setSelectedOperator,
  setBuildingMultiValue,
  setInputText,
  setMenuState,
  resetMenuAnchor,
  clearEditing,
  inputRef,
}: UseResumeBuildingDeps) =>
  useCallback(
    (chipId: string): boolean => {
      const idx = chipIdToConditionIndex(chipId);
      if (idx === null) return false;
      const condition = conditions[idx];
      if (!condition || condition.disabled) return false;
      const field = fields.find(f => f.name === condition.field);
      // Unknown field — only the attribute is editable; leave it to the normal path.
      if (!field) return false;

      const baseOperatorMissing = !condition.operator;
      const baseOperatorTakesValue =
        condition.operator != null && !isNoValueOperator(condition.operator);
      const baseValueMissing = baseOperatorTakesValue && isEmptyValue(condition.value);

      const startBuilding = (params: {
        base: BuildingBase | null;
        side: 0 | 1;
        selectedField: FieldMetadata;
        selectedOperator: FilterOperator | null;
        menuState: MenuState;
      }) => {
        clearEditing();
        removeConditionAtIndex(idx);
        setInsertIndex(idx);
        setBuildingBase(params.base);
        setBuildingSide(params.side);
        setSelectedField(params.selectedField);
        setSelectedOperator(params.selectedOperator);
        setBuildingMultiValue(undefined);
        setInputText('');
        resetMenuAnchor();
        setMenuState(params.menuState);
        // Building chip renders next frame — focus its input so typing/menu work.
        requestAnimationFrame(() => inputRef.current?.focus());
      };

      // Operator missing (attribute-only chip): let inline-edit reopen the
      // operator menu in place. It already advances operator → value on its own
      // and — crucially — never removes the chip, so "click to continue" can't
      // look like a deletion (AS-1179).
      if (baseOperatorMissing) return false;

      // Base value missing. Resume into the building cascade ONLY for a paired
      // field, where picking the value must flow on into the second triplet —
      // something inline-edit can't do. A plain field just reopens its value
      // menu in place (no chip removal).
      if (baseValueMissing) {
        if (!field.pairedField) return false;
        startBuilding({
          base: null,
          side: 0,
          selectedField: field,
          selectedOperator: condition.operator ?? null,
          menuState: 'value',
        });
        return true;
      }

      // Base complete. For a value-bearing paired field, resume the second
      // triplet when its operator or value is still missing.
      if (field.pairedField && !isNoValueOperator(condition.operator!)) {
        const pairOperator = condition.pair?.operator;
        const pairOperatorMissing = !pairOperator;
        const pairOperatorTakesValue = pairOperator != null && !isNoValueOperator(pairOperator);
        const pairValueMissing = pairOperatorTakesValue && isEmptyValue(condition.pair?.value);

        if (pairOperatorMissing || pairValueMissing) {
          startBuilding({
            base: { field, operator: condition.operator, value: condition.value },
            side: 1,
            selectedField: field.pairedField,
            selectedOperator: pairOperator ?? null,
            menuState: pairOperatorMissing ? 'operator' : 'value',
          });
          return true;
        }
      }

      return false;
    },
    [
      conditions,
      fields,
      removeConditionAtIndex,
      setInsertIndex,
      setBuildingBase,
      setBuildingSide,
      setSelectedField,
      setSelectedOperator,
      setBuildingMultiValue,
      setInputText,
      setMenuState,
      resetMenuAnchor,
      clearEditing,
      inputRef,
    ],
  );
