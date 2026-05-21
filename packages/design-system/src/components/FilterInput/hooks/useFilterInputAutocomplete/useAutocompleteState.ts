import { useLayoutEffect, useRef, useState } from 'react';
import type { Condition, FieldMetadata, FilterOperator, MenuState } from '../../types';

interface UseAutocompleteStateOptions {
  conditions: Condition[];
}

/**
 * Owns the useState/useRef surface of the autocomplete hook. Refs mirror
 * state so sub-hooks read synchronously without recreating callbacks.
 */
export const useAutocompleteState = ({ conditions }: UseAutocompleteStateOptions) => {
  const [inputText, setInputText] = useState('');
  const [menuState, setMenuState] = useState<MenuState>('closed');
  const [selectedField, setSelectedField] = useState<FieldMetadata | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [buildingMultiValue, setBuildingMultiValue] = useState<string | undefined>(undefined);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [insertAfterConnector, setInsertAfterConnector] = useState(false);
  const effectiveInsertIndex = insertIndex ?? conditions.length;

  // Fresh values for callbacks (avoids stale closures). Mirrored in a
  // layout effect so sub-hooks reading these refs in their own layout-phase
  // effects still observe the latest value before the browser paints.
  const effectiveInsertIndexRef = useRef(effectiveInsertIndex);
  const conditionsRef = useRef(conditions);
  const conditionsLengthRef = useRef(conditions.length);
  useLayoutEffect(() => {
    effectiveInsertIndexRef.current = effectiveInsertIndex;
    conditionsRef.current = conditions;
    conditionsLengthRef.current = conditions.length;
  });

  // Set by FilterInputValueMenu when open in multi-select.
  const blurCommitRef = useRef<(() => boolean) | null>(null);

  // Inline segment input refs (used by useFocusManagement).
  const segmentAttributeInputRef = useRef<HTMLInputElement>(null);
  const segmentOperatorInputRef = useRef<HTMLInputElement>(null);
  const segmentValueInputRef = useRef<HTMLInputElement>(null);

  // Indirection ref breaks the useMenuFlow ↔ useBlurCommit cycle.
  const commitBuildingOnBlurRef = useRef<() => boolean>(() => false);

  // Same indirection for the area-click commit (force-commit variant —
  // promotes incomplete building chips to error chips). Mirrored by useBlurCommit.
  const commitBuildingForceRef = useRef<() => boolean>(() => false);

  return {
    inputText,
    setInputText,
    menuState,
    setMenuState,
    selectedField,
    setSelectedField,
    selectedOperator,
    setSelectedOperator,
    isFocused,
    setIsFocused,
    buildingMultiValue,
    setBuildingMultiValue,
    insertIndex,
    setInsertIndex,
    insertAfterConnector,
    setInsertAfterConnector,
    effectiveInsertIndex,
    effectiveInsertIndexRef,
    conditionsRef,
    conditionsLengthRef,
    blurCommitRef,
    segmentAttributeInputRef,
    segmentOperatorInputRef,
    segmentValueInputRef,
    commitBuildingOnBlurRef,
    commitBuildingForceRef,
  };
};
