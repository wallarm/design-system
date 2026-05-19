import type { RefObject } from 'react';
import type { ChipSegment } from '../../../FilterInputField/FilterInputChip';
import type {
  Condition,
  FieldMetadata,
  FilterOperator,
  MenuState,
  UpsertCondition,
} from '../../../types';

export interface MenuFlowDeps {
  editing: {
    editingChipId: string | null;
    editingSegment: string | null;
    setEditingSegment: (segment: ChipSegment | null) => void;
    setSegmentFilterText: (text: string) => void;
    resetSegmentTyping: () => void;
    /** Switch inline-edit to another segment of the same committed chip,
     *  loading its text and resetting the user-typed flag in one step. */
    switchEditSegment: (segment: ChipSegment, currentText: string) => void;
    /** Exit inline-edit and the building-edit marker. Called when switching
     *  filter/operator in the building chip lands on the next menu. */
    clearEditing: () => void;
  };
  selectedField: FieldMetadata | null;
  selectedOperator: FilterOperator | null;
  fields: FieldMetadata[];
  inputRef: RefObject<HTMLInputElement | null>;
  insertIndex: number;
  upsertCondition: UpsertCondition;
  conditions: Condition[];
  resetState: (continueBuilding?: boolean) => void;
  /** Try to commit the building chip on menu close. Returns true if committed. */
  commitBuildingOnBlur: () => boolean;
  dateRange: { selectValue: (val: string) => string[] | null };
  setSelectedField: (f: FieldMetadata | null) => void;
  setSelectedOperator: (op: FilterOperator | null) => void;
  setInputText: (text: string) => void;
  setMenuState: (state: MenuState) => void;
  setBuildingMultiValue: (val: string | undefined) => void;
}

/** Shared shape: each sub-hook receives the same deps plus a ref to `conditions`
 *  that stays fresh without forcing callbacks to recreate on every keystroke. */
export interface MenuFlowInternalDeps extends MenuFlowDeps {
  conditionsRef: RefObject<Condition[]>;
}
