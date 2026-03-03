import type { ChangeEvent, KeyboardEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getOperatorFromLabel, getOperatorLabel, isMultiSelectOperator } from '../lib';
import type { Condition, FieldMetadata, FilterChipData, FilterOperator } from '../types';

type MenuState = 'closed' | 'field' | 'operator' | 'value';

interface UseFilterAutocompleteOptions {
  fields: FieldMetadata[];
  conditions: Condition[];
  chips: FilterChipData[];
  upsertCondition: (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
  ) => void;
  removeCondition: (chipId: string) => void;
  removeLastCondition: () => void;
  clearAll: () => void;
  toggleConnector: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  buildingChipRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
}

export const useFilterAutocomplete = ({
  fields,
  conditions,
  chips,
  upsertCondition,
  removeCondition,
  removeLastCondition,
  clearAll,
  toggleConnector,
  containerRef,
  buildingChipRef,
  inputRef,
}: UseFilterAutocompleteOptions) => {
  const [inputText, setInputText] = useState('');
  const [menuState, setMenuState] = useState<MenuState>('closed');
  const [selectedField, setSelectedField] = useState<FieldMetadata | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const [multiSelectValues, setMultiSelectValues] = useState<Array<string | number | boolean>>([]);
  const lastTransitionRef = useRef(0);
  const menuOffsetRef = useRef(0);

  const isBuilding = !editingChipId && selectedField !== null;

  // Update menu offset to align with the building chip's left edge
  const updateBuildingChipOffset = () => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const chipRect = buildingChipRef.current?.getBoundingClientRect();
    if (containerRect && chipRect) {
      menuOffsetRef.current = chipRect.left - containerRect.left;
    }
  };

  // After building chip renders, update menu offset to align dropdown with the chip
  useEffect(() => {
    if (isBuilding && menuState !== 'closed') {
      updateBuildingChipOffset();
    }
  });

  // Auto-open field menu ONLY on initial focus (not after Escape)
  const prevFocusedRef = useRef(false);
  useEffect(() => {
    if (isFocused && !prevFocusedRef.current && conditions.length === 0 && inputText === '') {
      lastTransitionRef.current = Date.now();
      menuOffsetRef.current = 0;
      setMenuState('field');
    }
    prevFocusedRef.current = isFocused;
  }, [isFocused, conditions.length, inputText]);

  const resetState = () => {
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    setEditingChipId(null);
    setMultiSelectValues([]);
    setMenuState('closed');
    menuOffsetRef.current = 0;
    inputRef.current?.focus();
  };

  const handleMenuClose = useCallback(() => {
    if (multiSelectValues.length > 0 && selectedField && selectedOperator) {
      upsertCondition(selectedField, selectedOperator, multiSelectValues, editingChipId);
    }
    setMenuState('closed');
    setSelectedField(null);
    setSelectedOperator(null);
    setEditingChipId(null);
    setMultiSelectValues([]);
    menuOffsetRef.current = 0;
    inputRef.current?.focus();
  }, [multiSelectValues, selectedField, selectedOperator, editingChipId, upsertCondition, inputRef]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (text && !selectedField) {
      lastTransitionRef.current = Date.now();
      setMenuState('field');
    } else if (!text && !selectedField) {
      setMenuState(isFocused && conditions.length === 0 ? 'field' : 'closed');
    }
  };

  const handleFieldSelect = (field: FieldMetadata) => {
    lastTransitionRef.current = Date.now();
    setSelectedField(field);
    setInputText('');
    setMenuState('operator');
  };

  const handleOperatorSelect = (operator: FilterOperator) => {
    const noValueOps: FilterOperator[] = ['is_null', 'is_not_null'];

    if (noValueOps.includes(operator)) {
      upsertCondition(selectedField!, operator, null, editingChipId);
      resetState();
      return;
    }

    lastTransitionRef.current = Date.now();
    setSelectedOperator(operator);
    setMenuState('value');
  };

  const handleValueSelect = (val: string | number | boolean) => {
    if (!selectedField || !selectedOperator) return;

    if (isMultiSelectOperator(selectedOperator)) {
      setMultiSelectValues(prev =>
        prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val],
      );
      return;
    }

    upsertCondition(selectedField, selectedOperator, val, editingChipId);
    resetState();
  };

  const handleChipRemove = (chipId: string) => {
    removeCondition(chipId);
    menuOffsetRef.current = 0;
    inputRef.current?.focus();
  };

  const handleClear = () => {
    clearAll();
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    setEditingChipId(null);
    setMultiSelectValues([]);
    setMenuState('closed');
    menuOffsetRef.current = 0;
    inputRef.current?.focus();
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
      menuOffsetRef.current = segmentEl.getBoundingClientRect().left - containerRect.left;
    } else {
      menuOffsetRef.current = 0;
    }

    lastTransitionRef.current = Date.now();
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputText === '' && conditions.length > 0) {
      e.preventDefault();
      removeLastCondition();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (Date.now() - lastTransitionRef.current < 400) return;

      const activeEl = document.activeElement;
      const isInContainer = containerRef.current?.contains(activeEl);
      const isInMenu = activeEl?.closest('[data-scope="menu"]');
      if (!isInContainer && !isInMenu) {
        if (multiSelectValues.length > 0 && selectedField && selectedOperator) {
          upsertCondition(selectedField, selectedOperator, multiSelectValues, editingChipId);
        }
        setIsFocused(false);
        setMenuState('closed');
        setSelectedField(null);
        setSelectedOperator(null);
        setEditingChipId(null);
        setMultiSelectValues([]);
      }
    }, 200);
  };

  // Building chip data for in-progress filter
  const buildingMultiValue = multiSelectValues.length > 0
    ? multiSelectValues
      .map(v => selectedField?.values?.find(opt => opt.value === v)?.label ?? String(v))
      .join(', ')
    : undefined;

  const buildingChipData = isBuilding ? {
    variant: 'chip' as const,
    attribute: selectedField!.label,
    operator: selectedOperator ? getOperatorLabel(selectedOperator, selectedField!.type) : undefined,
    value: buildingMultiValue,
  } : null;

  // Positioning for all menus — shifts horizontally to follow the active chip
  const menuPositioning = useMemo(() => ({
    placement: 'bottom-start' as const,
    gutter: 4,
    getAnchorRect: () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: rect.left + menuOffsetRef.current,
        y: rect.y,
        width: rect.width - menuOffsetRef.current,
        height: rect.height,
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left + menuOffsetRef.current,
        right: rect.right,
      };
    },
  }), [containerRef]);

  return {
    inputText,
    menuState,
    selectedField,
    selectedOperator,
    multiSelectValues,
    isBuilding,
    buildingChipData,
    menuPositioning,
    handleInputChange,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMenuClose,
    handleChipClick,
    handleChipRemove,
    handleClear,
    handleKeyDown,
    handleFocus,
    handleBlur,
  };
};
