import type { ChangeEvent, FC, FocusEvent, HTMLAttributes, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

/**
 * FilterField - Self-contained filter component.
 * Handles autocomplete flow (field → operator → value), chip creation, and expression management.
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
  const [chips, setChips] = useState<FilterChipData[]>([]);
  const [selectedField, setSelectedField] = useState<FieldMetadata | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [menuLeftOffset, setMenuLeftOffset] = useState(0);
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const [multiSelectValues, setMultiSelectValues] = useState<Array<string | number | boolean>>([]);
  // Timestamp of last menu transition — blur won't close within 400ms of a transition
  const lastTransitionRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buildingChipRef = useRef<HTMLDivElement>(null);

  // Convert expression to chips
  const expressionToChips = useCallback((expr: ExprNode | null): FilterChipData[] => {
    if (!expr || expr.type !== 'condition') return [];

    const condition = expr as Condition;
    const field = fields.find(f => f.name === condition.field);

    return [{
      id: `chip-${Date.now()}`,
      variant: 'chip',
      attribute: field?.label || condition.field,
      operator: getOperatorLabel(condition.operator, field?.type || 'string'),
      value: Array.isArray(condition.value)
        ? condition.value.map(v => field?.values?.find(opt => opt.value === v)?.label ?? String(v)).join(', ')
        : String(condition.value ?? ''),
      error,
    }];
  }, [fields, error]);

  // Sync chips with value prop (controlled mode)
  useEffect(() => {
    if (value !== undefined) {
      setChips(expressionToChips(value));
    }
  }, [value, expressionToChips]);

  // Auto-open field menu ONLY on initial focus (not after Escape)
  const prevFocusedRef = useRef(false);
  useEffect(() => {
    // Only open when isFocused transitions from false → true
    if (isFocused && !prevFocusedRef.current && chips.length === 0 && inputText === '') {
      setMenuLeftOffset(0);
      setMenuState('field');
    }
    prevFocusedRef.current = isFocused;
  }, [isFocused, chips.length, inputText]);

  // Global Escape handler — works even when menu buttons have focus
  useEffect(() => {
    if (menuState === 'closed') return;

    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        // If multi-select with values chosen → confirm them
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
      setMenuState(isFocused && chips.length === 0 ? 'field' : 'closed');
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

    // Multi-select: toggle value in the list
    if (isMultiSelectOperator(selectedOperator)) {
      setMultiSelectValues(prev =>
        prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val],
      );
      return;
    }

    // Single-select: create chip immediately
    createChip(selectedField, selectedOperator, val);
    resetState();
  };

  const handleMultiSelectConfirm = () => {
    if (selectedField && selectedOperator && multiSelectValues.length > 0) {
      createChip(selectedField, selectedOperator, multiSelectValues);
      resetState();
    }
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

    // Build display value — join labels for arrays (in/not_in)
    let displayValue: string;
    if (Array.isArray(val)) {
      displayValue = val
        .map(v => field.values?.find(opt => opt.value === v)?.label ?? String(v))
        .join(', ');
    } else {
      const valueOption = field.values?.find(v => v.value === val);
      displayValue = valueOption?.label ?? String(val ?? '');
    }

    const newChip: FilterChipData = {
      id: `chip-${Date.now()}`,
      variant: 'chip',
      attribute: field.label,
      operator: getOperatorLabel(operator, field.type),
      value: displayValue,
      error,
    };

    setChips([newChip]);
    onChange?.(condition);
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
    setChips(prev => prev.filter(c => c.id !== chipId));
    onChange?.(null);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setChips([]);
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    setEditingChipId(null);
    setMultiSelectValues([]);
    setMenuState('closed');
    onChange?.(null);
    inputRef.current?.focus();
  };

  const handleChipClick = (chipId: string, e: ReactMouseEvent) => {
    const chip = chips.find(c => c.id === chipId);
    if (!chip || chip.variant !== 'chip') return;

    const field = fields.find(f => f.label === chip.attribute);
    if (!field) return;

    // Detect which segment was clicked via data-slot attribute
    const target = e.target as HTMLElement;
    const segmentEl = target.closest('[data-slot]') as HTMLElement | null;
    const slot = segmentEl?.getAttribute('data-slot');

    // Calculate left offset of clicked segment relative to container
    if (segmentEl && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const segmentRect = segmentEl.getBoundingClientRect();
      setMenuLeftOffset(segmentRect.left - containerRect.left);
    }

    lastTransitionRef.current = Date.now();
    setEditingChipId(chipId);
    setSelectedField(field);

    if (slot === 'segment-attribute') {
      // Click on field name → open field menu
      setSelectedOperator(null);
      setMenuState('field');
    } else if (slot === 'segment-value') {
      // Click on value → open value menu (need raw operator)
      const rawOperator = getOperatorFromLabel(chip.operator || '', field.type);
      setSelectedOperator(rawOperator);
      setMenuState('value');
    } else {
      // Click on operator or chip container → open operator menu
      setSelectedOperator(null);
      setMenuState('operator');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputText === '' && chips.length > 0) {
      e.preventDefault();
      const lastChip = chips[chips.length - 1];
      if (lastChip) {
        handleChipRemove(lastChip.id);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    setTimeout(() => {
      // Don't close within 400ms of a menu transition (field→operator→value click)
      if (Date.now() - lastTransitionRef.current < 400) return;

      const activeEl = document.activeElement;
      if (!containerRef.current?.contains(activeEl)) {
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

  // Progressive building chip — shows attribute/operator as user selects them
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

  // Reposition dropdown to the right edge of the building chip
  useLayoutEffect(() => {
    if (!isBuilding || !buildingChipRef.current || !containerRef.current) return;
    if (menuState !== 'operator' && menuState !== 'value') return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const chipRect = buildingChipRef.current.getBoundingClientRect();
    setMenuLeftOffset(chipRect.right - containerRect.left);
  });

  const hasChips = chips.length > 0;
  const hasContent = hasChips || isBuilding;
  const visibleChips = chips.slice(0, 3);
  const hasMoreChips = chips.length > 3;

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
              {visibleChips.map(chip => (
                <div
                  key={chip.id}
                  className='shrink-0 cursor-pointer hover:z-10'
                  onClick={(e) => handleChipClick(chip.id, e)}
                >
                  <FilterChip {...chip} onRemove={() => handleChipRemove(chip.id)} />
                </div>
              ))}
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

      {/* Dropdown menus — NO onOpenChange, we manage state ourselves */}
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
