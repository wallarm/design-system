import type { ChangeEvent, FC, FocusEvent, HTMLAttributes, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../../utils/cn';
import { FilterInputBar } from '../FilterInputBar';
import { FilterMainMenu } from '../FilterMainMenu';
import { FilterOperatorMenu } from '../FilterOperatorMenu';
import { FilterValueMenu } from '../FilterValueMenu';
import type {
  Condition,
  ExprNode,
  FieldMetadata,
  FilterChipData,
  FilterOperator,
  Group,
} from '../types';
import { getOperatorFromLabel, getOperatorLabel } from '../types';

export interface FilterFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /**
   * Available fields from backend API config
   */
  fields?: FieldMetadata[];
  /**
   * Current filter expression value (controlled mode)
   */
  value?: ExprNode | null;
  /**
   * Callback when filter expression changes
   */
  onChange?: (expression: ExprNode | null) => void;
  /**
   * Placeholder text to display when field is empty
   * @default "Type to filter..."
   */
  placeholder?: string;
  /**
   * Whether the field has a validation error
   */
  error?: boolean;
  /**
   * Whether to show the keyboard hint (⌘K or Ctrl+K)
   */
  showKeyboardHint?: boolean;
}

type MenuState = 'closed' | 'field' | 'operator' | 'value';

/** Build an ExprNode from conditions + connector operator */
function buildExpression(conditions: Condition[], connectorOp: 'and' | 'or'): ExprNode | null {
  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];
  return { type: 'group', operator: connectorOp, children: conditions };
}

/** Extract conditions + connector from an ExprNode */
function expressionToConditions(expr: ExprNode | null): { conditions: Condition[]; connector: 'and' | 'or' } {
  if (!expr) return { conditions: [], connector: 'and' };
  if (expr.type === 'condition') return { conditions: [expr], connector: 'and' };
  const group = expr as Group;
  const conditions = group.children.filter((c): c is Condition => c.type === 'condition');
  return { conditions, connector: group.operator };
}

/**
 * FilterField - Self-contained filter component.
 * Handles autocomplete flow (field → operator → value), chip creation, and expression management.
 * Supports multiple conditions joined by AND/OR connectors.
 * Just pass `fields` config from backend API and it works.
 */
export const FilterField: FC<FilterFieldProps> = ({
  fields = [],
  value,
  onChange,
  placeholder = 'Type to filter...',
  error = false,
  showKeyboardHint = false,
  className,
  ...props
}) => {
  const [inputText, setInputText] = useState('');
  const [menuState, setMenuState] = useState<MenuState>('closed');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [connectorOperator, setConnectorOperator] = useState<'and' | 'or'>('and');
  const [selectedField, setSelectedField] = useState<FieldMetadata | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const [multiSelectValues, setMultiSelectValues] = useState<Array<string | number | boolean>>([]);
  const lastTransitionRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buildingChipRef = useRef<HTMLDivElement>(null);
  // Horizontal pixel offset for dropdown positioning (relative to container left)
  const menuOffsetRef = useRef(0);

  /** Map a chip ID (e.g. "chip-2") back to condition index */
  const chipIdToConditionIndex = (chipId: string): number | null => {
    const match = chipId.match(/^chip-(\d+)$/);
    return match ? Number(match[1]) : null;
  };

  // Derive display chips from conditions + connector operator
  const chips = useMemo((): FilterChipData[] => {
    const result: FilterChipData[] = [];
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const field = fields.find(f => f.name === condition.field);

      let displayValue: string;
      if (Array.isArray(condition.value)) {
        displayValue = condition.value
          .map(v => field?.values?.find(opt => opt.value === v)?.label ?? String(v))
          .join(', ');
      } else {
        displayValue = String(condition.value ?? '');
        if (field?.values) {
          const opt = field.values.find(o => o.value === condition.value);
          if (opt) displayValue = opt.label;
        }
      }

      if (i > 0) {
        result.push({
          id: `connector-${i}`,
          variant: connectorOperator,
          error,
        });
      }

      result.push({
        id: `chip-${i}`,
        variant: 'chip',
        attribute: field?.label || condition.field,
        operator: getOperatorLabel(condition.operator, field?.type || 'string'),
        value: displayValue,
        error,
      });
    }
    return result;
  }, [conditions, connectorOperator, fields, error]);

  // Sync conditions with value prop (controlled mode)
  useEffect(() => {
    if (value !== undefined) {
      const { conditions: newConditions, connector } = expressionToConditions(value);
      setConditions(newConditions);
      setConnectorOperator(connector);
    }
  }, [value]);

  // After building chip renders, update menu offset to align dropdown with the chip
  useEffect(() => {
    if (isBuilding && menuState !== 'closed') {
      updateBuildingChipOffset();
    }
  });

  // Auto-open field menu ONLY on initial focus (not after Escape)
  const prevFocusedRef = useRef(false);
  useEffect(() => {
    // Only open when isFocused transitions from false → true
    if (isFocused && !prevFocusedRef.current && conditions.length === 0 && inputText === '') {
      menuOffsetRef.current = 0;
      setMenuState('field');
    }
    prevFocusedRef.current = isFocused;
  }, [isFocused, conditions.length, inputText]);

  // Called by useKeyboardNav (via onClose) when user presses Escape in any menu
  const handleMenuClose = useCallback(() => {
    // Confirm multi-select if values were chosen
    if (multiSelectValues.length > 0 && selectedField && selectedOperator) {
      createChip(selectedField, selectedOperator, multiSelectValues);
    }
    setMenuState('closed');
    setSelectedField(null);
    setSelectedOperator(null);
    setEditingChipId(null);
    setMultiSelectValues([]);
    menuOffsetRef.current = 0;
    inputRef.current?.focus();
  }, [multiSelectValues, selectedField, selectedOperator]);

  // ── Handlers ──────────────────────────────────────────────

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (text && !selectedField) {
      setMenuState('field');
    } else if (!text && !selectedField) {
      setMenuState(isFocused && conditions.length === 0 ? 'field' : 'closed');
    }
  };

  // Update menu offset to align with the building chip's left edge
  const updateBuildingChipOffset = () => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const chipRect = buildingChipRef.current?.getBoundingClientRect();
    if (containerRect && chipRect) {
      menuOffsetRef.current = chipRect.left - containerRect.left;
    }
  };

  const handleFieldSelect = (field: FieldMetadata) => {
    lastTransitionRef.current = Date.now();
    setSelectedField(field);
    setInputText('');
    // Offset will be updated after render via useEffect
    setMenuState('operator');
  };

  const handleOperatorSelect = (operator: FilterOperator) => {
    const noValueOps: FilterOperator[] = ['is_null', 'is_not_null'];

    if (noValueOps.includes(operator)) {
      createChip(selectedField!, operator, null);
      resetState();
      return;
    }

    lastTransitionRef.current = Date.now();
    setSelectedOperator(operator);
    setMenuState('value');
  };

  const isMultiSelectOperator = (op: FilterOperator | null): boolean =>
    op === 'in' || op === 'not_in';

  const handleValueSelect = (val: string | number | boolean) => {
    if (!selectedField || !selectedOperator) return;

    if (isMultiSelectOperator(selectedOperator)) {
      setMultiSelectValues(prev =>
        prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val],
      );
      return;
    }

    createChip(selectedField, selectedOperator, val);
    resetState();
  };

  const createChip = (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
  ) => {
    const condition: Condition = {
      type: 'condition',
      field: field.name,
      operator,
      value: val,
    };

    setConditions(prev => {
      let newConditions: Condition[];

      if (editingChipId) {
        const idx = chipIdToConditionIndex(editingChipId);
        if (idx !== null && idx < prev.length) {
          newConditions = [...prev];
          newConditions[idx] = condition;
        } else {
          newConditions = [...prev, condition];
        }
      } else {
        newConditions = [...prev, condition];
      }

      const expr = buildExpression(newConditions, connectorOperator);
      onChange?.(expr);

      return newConditions;
    });
  };

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

  const handleChipRemove = (chipId: string) => {
    const idx = chipIdToConditionIndex(chipId);
    if (idx === null) return;

    setConditions(prev => {
      const newConditions = prev.filter((_, i) => i !== idx);
      const expr = buildExpression(newConditions, connectorOperator);
      onChange?.(expr);
      return newConditions;
    });
    menuOffsetRef.current = 0;
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setConditions([]);
    setConnectorOperator('and');
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    setEditingChipId(null);
    setMultiSelectValues([]);
    setMenuState('closed');
    menuOffsetRef.current = 0;
    onChange?.(null);
    inputRef.current?.focus();
  };

  const handleConnectorClick = () => {
    setConnectorOperator(prev => {
      const next = prev === 'and' ? 'or' : 'and';
      const expr = buildExpression(conditions, next);
      onChange?.(expr);
      return next;
    });
  };

  const handleChipClick = (chipId: string, e: ReactMouseEvent) => {
    if (chipId.startsWith('connector-')) {
      handleConnectorClick();
      return;
    }

    const idx = chipIdToConditionIndex(chipId);
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

    // Compute horizontal offset: align dropdown to the clicked chip segment
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
      setConditions(prev => {
        const newConditions = prev.slice(0, -1);
        const expr = buildExpression(newConditions, connectorOperator);
        onChange?.(expr);
        return newConditions;
      });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (_e: FocusEvent<HTMLDivElement>) => {
    setTimeout(() => {
      if (Date.now() - lastTransitionRef.current < 400) return;

      const activeEl = document.activeElement;
      // Check both the container and Portal-rendered menu content
      const isInContainer = containerRef.current?.contains(activeEl);
      const isInMenu = activeEl?.closest('[data-scope="menu"]');
      if (!isInContainer && !isInMenu) {
        // Confirm multi-select if values were chosen
        if (multiSelectValues.length > 0 && selectedField && selectedOperator) {
          createChip(selectedField, selectedOperator, multiSelectValues);
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

  // ── Render ────────────────────────────────────────────────

  const isBuilding = !editingChipId && selectedField !== null;
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
  }), []);

  const maxVisibleConditions = 3;
  const hasMoreChips = conditions.length > maxVisibleConditions;

  const visibleChips = useMemo(() => {
    if (!hasMoreChips) return chips;
    const result: FilterChipData[] = [];
    let condCount = 0;
    for (const chip of chips) {
      if (chip.variant === 'chip') {
        condCount++;
        if (condCount > maxVisibleConditions) break;
      }
      result.push(chip);
    }
    return result;
  }, [chips, hasMoreChips]);

  const hasChips = conditions.length > 0;
  const hasContent = hasChips || isBuilding;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <FilterInputBar
        chips={visibleChips}
        buildingChipData={buildingChipData}
        buildingChipRef={buildingChipRef}
        inputText={inputText}
        onInputChange={handleInputChange}
        onInputKeyDown={handleKeyDown}
        inputRef={inputRef}
        placeholder={placeholder}
        error={error}
        showKeyboardHint={showKeyboardHint}
        menuOpen={menuState !== 'closed'}
        onChipClick={handleChipClick}
        onChipRemove={handleChipRemove}
        onClear={handleClear}
        hasMoreChips={hasMoreChips}
        hasContent={hasContent}
        hasChips={hasChips}
        {...props}
      />

      {/* Dropdown menus — positioned below the input container */}
      <FilterMainMenu
        fields={fields}
        open={menuState === 'field'}
        onSelect={handleFieldSelect}
        onOpenChange={open => { if (!open) handleMenuClose(); }}
        positioning={menuPositioning}
      />

      {selectedField && (
        <FilterOperatorMenu
          fieldType={selectedField.type}
          open={menuState === 'operator'}
          onSelect={handleOperatorSelect}
          onOpenChange={open => { if (!open) handleMenuClose(); }}
          positioning={menuPositioning}
        />
      )}

      {selectedField && selectedOperator && (
        <FilterValueMenu
          values={selectedField.values || []}
          open={menuState === 'value'}
          onSelect={handleValueSelect}
          onOpenChange={open => { if (!open) handleMenuClose(); }}
          multiSelect={isMultiSelectOperator(selectedOperator)}
          selectedValues={multiSelectValues}
          positioning={menuPositioning}
        />
      )}
    </div>
  );
};

FilterField.displayName = 'FilterField';
