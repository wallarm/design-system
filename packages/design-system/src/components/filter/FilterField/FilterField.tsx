import type { ChangeEvent, FC, FocusEvent, HTMLAttributes, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { getOperatorLabel } from '../types';

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
  // Timestamp of last menu transition — blur won't close within 400ms of a transition
  const lastTransitionRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      value: String(condition.value ?? ''),
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
        setMenuState('closed');
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [menuState]);

  // ── Handlers ──────────────────────────────────────────────

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

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

  const handleValueSelect = (val: string | number | boolean) => {
    if (selectedField && selectedOperator) {
      createChip(selectedField, selectedOperator, val);
      resetState();
    }
  };

  const createChip = (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null,
  ) => {
    const condition: Condition = {
      type: 'condition',
      field: field.name,
      operator,
      value: val,
    };

    // Use the label from field.values if available, otherwise fall back to raw value
    const valueOption = field.values?.find(v => v.value === val);
    const displayValue = valueOption?.label ?? String(val ?? '');

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
    setMenuState('closed');
    onChange?.(null);
    inputRef.current?.focus();
  };

  const handleChipClick = (chipId: string) => {
    const chip = chips.find(c => c.id === chipId);
    if (!chip || chip.variant !== 'chip') return;

    const field = fields.find(f => f.label === chip.attribute);
    if (field) {
      lastTransitionRef.current = Date.now();
      setSelectedField(field);
      setSelectedOperator(null);
      setChips([]);
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
        setIsFocused(false);
        setMenuState('closed');
        setSelectedField(null);
        setSelectedOperator(null);
      }
    }, 200);
  };

  // ── Render ────────────────────────────────────────────────

  const hasChips = chips.length > 0;
  const visibleChips = chips.slice(0, 3);
  const hasMoreChips = chips.length > 3;

  return (
    <div
      ref={containerRef}
      className='relative inline-block w-full'
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Input bar */}
      <div
        className={cn(
          'relative flex h-10 w-full max-w-[800px] items-center overflow-clip rounded-lg',
          'border border-border-primary bg-component-input-bg shadow-xs',
          !error && 'hover:border-component-border-input-hover',
          error && 'hover:shadow-[0px_0px_0px_3px_rgba(231,0,11,0.3)]',
          !error && 'focus-within:border-border-strong-primary focus-within:shadow-focus-ring-primary',
          error && 'border-border-strong-danger',
          error && 'focus-within:border-border-strong-danger focus-within:shadow-[0px_0px_0px_3px_rgba(231,0,11,0.2)]',
          className,
        )}
        role='combobox'
        aria-expanded={menuState !== 'closed'}
        aria-invalid={error}
        data-slot='filter-field'
        {...props}
      >
        <div className={cn('flex flex-1 items-center gap-2 pr-1', hasChips ? 'pl-2' : 'pl-3')}>
          {hasChips && (
            <div className='flex items-center gap-1'>
              {visibleChips.map(chip => (
                <div
                  key={chip.id}
                  className='shrink-0 cursor-pointer'
                  onClick={() => handleChipClick(chip.id)}
                >
                  <FilterChip {...chip} onRemove={() => handleChipRemove(chip.id)} />
                </div>
              ))}
              {hasMoreChips && (
                <p className='pl-1 text-sm leading-5 text-text-secondary'>{placeholder}</p>
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
              placeholder={hasChips ? '' : placeholder}
              className='flex-1 bg-transparent outline-none text-sm leading-5 text-text-primary placeholder:text-text-secondary'
            />
          )}
        </div>

        <div className='flex shrink-0 items-center gap-2 pr-3'>
          {showKeyboardHint && !hasChips && (
            <div className='flex items-center gap-0.5'>
              <kbd className='inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-component-border-hotkey bg-bg-surface-2 px-1 text-xs'>⌘</kbd>
              <kbd className='inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-component-border-hotkey bg-bg-surface-2 px-1 text-xs'>K</kbd>
            </div>
          )}
          {hasChips && (
            <button
              type='button'
              onClick={handleClear}
              className='flex h-6 w-6 items-center justify-center rounded-full hover:bg-bg-neutral-subtle'
              aria-label='Clear all filters'
            >
              <X className='h-4 w-4 text-text-secondary' />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown menus — NO onOpenChange, we manage state ourselves */}
      {menuState === 'field' && (
        <div className='absolute top-full left-0 mt-1 z-50'>
          <FilterMainMenu
            fields={fields}
            open={true}
            onSelect={handleFieldSelect}
          />
        </div>
      )}

      {menuState === 'operator' && selectedField && (
        <div className='absolute top-full left-0 mt-1 z-50'>
          <FilterOperatorMenu
            fieldType={selectedField.type}
            open={true}
            onSelect={handleOperatorSelect}
          />
        </div>
      )}

      {menuState === 'value' && selectedField && selectedOperator && (
        <div className='absolute top-full left-0 mt-1 z-50'>
          <FilterValueMenu
            values={selectedField.values || []}
            open={true}
            onSelect={handleValueSelect}
          />
        </div>
      )}
    </div>
  );
};

FilterField.displayName = 'FilterField';
