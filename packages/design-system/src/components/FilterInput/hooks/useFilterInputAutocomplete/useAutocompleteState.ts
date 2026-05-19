import { useRef, useState } from 'react';
import type { Condition, FieldMetadata, FilterOperator, MenuState } from '../../types';

interface UseAutocompleteStateOptions {
  conditions: Condition[];
}

/**
 * Owns the entire useState / useRef surface of the autocomplete hook. Splitting
 * this out of the orchestrator keeps `useFilterInputAutocomplete` focused on
 * wiring sub-hooks together rather than reading 30 lines of declarations.
 *
 * Each ref intentionally mirrors a piece of state — sub-hooks read the ref
 * synchronously to avoid re-creating callbacks on every keystroke that mutates
 * conditions / insertIndex / etc.
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

  // Refs keep values fresh for callbacks to avoid stale closures and unnecessary recreation
  const effectiveInsertIndexRef = useRef(effectiveInsertIndex);
  effectiveInsertIndexRef.current = effectiveInsertIndex;
  const conditionsRef = useRef(conditions);
  conditionsRef.current = conditions;
  const conditionsLengthRef = useRef(conditions.length);
  conditionsLengthRef.current = conditions.length;

  // Multi-select blur commit ref — set by FilterInputValueMenu when open in multi-select mode
  const blurCommitRef = useRef<(() => boolean) | null>(null);

  // Inline segment input refs — used by useFocusManagement to focus the right input
  const segmentAttributeInputRef = useRef<HTMLInputElement>(null);
  const segmentOperatorInputRef = useRef<HTMLInputElement>(null);
  const segmentValueInputRef = useRef<HTMLInputElement>(null);

  // Indirection ref breaks the circular dep useMenuFlow ↔ useBlurCommit:
  // useMenuFlow calls through this ref, useBlurCommit assigns its callback to it.
  const commitBuildingOnBlurRef = useRef<() => boolean>(() => false);

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
  };
};
