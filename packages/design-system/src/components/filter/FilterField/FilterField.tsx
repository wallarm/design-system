import type { ChangeEvent, FC, FocusEvent, HTMLAttributes, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { X } from '../../../icons/X';
import { cn } from '../../../utils/cn';
import { FilterChip } from '../FilterChip';
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
  const [menuLeftOffset, setMenuLeftOffset] = useState(0);
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const [multiSelectValues, setMultiSelectValues] = useState<Array<string | number | boolean>>([]);
  const lastTransitionRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buildingChipRef = useRef<HTMLDivElement>(null);

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

  // Auto-open field menu ONLY on initial focus (not after Escape)
  const prevFocusedRef = useRef(false);
  useEffect(() => {
    if (isFocused && !prevFocusedRef.current && conditions.length === 0 && inputText === '') {
      setMenuLeftOffset(0);
      setMenuState('field');
    }
    prevFocusedRef.current = isFocused;
  }, [isFocused, conditions.length, inputText]);

  // Global Escape handler
  useEffect(() => {
    if (menuState === 'closed') return;

    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (multiSelectValues.length > 0 && selectedField && selectedOperator) {
          createChip(selectedField, selectedOperator, multiSelectValues);
        }
        setMenuState('closed');
        setSelectedField(null);
        setSelectedOperator(null);
        setEditingChipId(null);
        setMultiSelectValues([]);
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [menuState, multiSelectValues, selectedField, selectedOperator]);

  // ── Handlers ──────────────────────────────────────────────

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    setMenuLeftOffset(0);

    if (text && !selectedField) {
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

    if (segmentEl && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const segmentRect = segmentEl.getBoundingClientRect();
      setMenuLeftOffset(segmentRect.left - containerRect.left);
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
      if (!containerRef.current?.contains(activeEl)) {
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

  useLayoutEffect(() => {
    if (!isBuilding || !buildingChipRef.current || !containerRef.current) return;
    if (menuState !== 'operator' && menuState !== 'value') return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const chipRect = buildingChipRef.current.getBoundingClientRect();
    setMenuLeftOffset(chipRect.right - containerRect.left);
  });

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
      {/* Input bar */}
      <div
        className={cn(
          'relative flex h-10 w-full items-center overflow-visible rounded-lg',
          'border border-border-primary bg-component-input-bg shadow-xs',
          !error && 'hover:border-component-border-input-hover',
          error && 'hover:shadow-[0px_0px_0px_3px_rgba(231,0,11,0.3)]',
          !error && 'focus-within:border-border-strong-primary focus-within:shadow-focus-ring-primary',
          error && 'border-border-strong-danger',
          error && 'focus-within:border-border-strong-danger focus-within:shadow-[0px_0px_0px_3px_rgba(231,0,11,0.2)]',
        )}
        role='combobox'
        aria-expanded={menuState !== 'closed'}
        aria-invalid={error}
        data-slot='filter-field'
        {...props}
      >
        <div className={cn('flex flex-1 items-center gap-2 pr-1', hasContent ? 'pl-2' : 'pl-3')}>
          {hasContent && (
            <div className='flex items-center gap-1'>
              {visibleChips.map(chip => {
                const isConnector = chip.variant === 'and' || chip.variant === 'or';
                return (
                  <div
                    key={chip.id}
                    className='shrink-0 cursor-pointer hover:z-10'
                    onClick={(e) => handleChipClick(chip.id, e)}
                  >
                    <FilterChip
                      {...chip}
                      onRemove={isConnector ? undefined : () => handleChipRemove(chip.id)}
                    />
                  </div>
                );
              })}
              {hasMoreChips && (
                <p className='pl-1 text-sm leading-5 text-text-secondary'>{placeholder}</p>
              )}
              {buildingChipData && (
                <div ref={buildingChipRef} className='shrink-0'>
                  <FilterChip {...buildingChipData} />
                </div>
              )}
            </div>
          )}

          {!hasMoreChips && (
            <input
              ref={inputRef}
              type='text'
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={hasContent ? '' : placeholder}
              className='flex-1 bg-transparent outline-none text-sm leading-5 text-text-primary placeholder:text-text-secondary'
            />
          )}
        </div>

        <div className='flex shrink-0 items-center gap-2 pr-3'>
          {showKeyboardHint && !hasContent && (
            <div className='flex items-center gap-0.5'>
              <kbd className='inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-component-border-hotkey bg-bg-surface-2 px-1 text-xs'>⌘</kbd>
              <kbd className='inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-component-border-hotkey bg-bg-surface-2 px-1 text-xs'>K</kbd>
            </div>
          )}
          {hasChips && (
            <button
              type='button'
              onClick={handleClear}
              className='flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-bg-neutral-subtle'
              aria-label='Clear all filters'
            >
              <X className='h-4 w-4 text-text-secondary' />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown menus */}
      {menuState === 'field' && (
        <div className='absolute top-full mt-1 z-50' style={{ left: menuLeftOffset }}>
          <FilterMainMenu
            fields={fields}
            open={true}
            onSelect={handleFieldSelect}
          />
        </div>
      )}

      {menuState === 'operator' && selectedField && (
        <div className='absolute top-full mt-1 z-50' style={{ left: menuLeftOffset }}>
          <FilterOperatorMenu
            fieldType={selectedField.type}
            open={true}
            onSelect={handleOperatorSelect}
          />
        </div>
      )}

      {menuState === 'value' && selectedField && selectedOperator && (
        <div className='absolute top-full mt-1 z-50' style={{ left: menuLeftOffset }}>
          <FilterValueMenu
            values={selectedField.values || []}
            open={true}
            onSelect={handleValueSelect}
            multiSelect={isMultiSelectOperator(selectedOperator)}
            selectedValues={multiSelectValues}
          />
        </div>
      )}
    </div>
  );
};

FilterField.displayName = 'FilterField';
