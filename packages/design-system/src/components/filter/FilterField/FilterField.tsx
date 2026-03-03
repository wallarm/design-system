import type { ChangeEvent, FC, FocusEvent, HTMLAttributes, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from '../../../icons/X';
import { cn } from '../../../utils/cn';
import { FilterChip } from '../FilterChip';
import { FilterMainMenu } from '../FilterMainMenu';
import { FilterOperatorMenu } from '../FilterOperatorMenu';
import { FilterValueMenu } from '../FilterValueMenu';
import { parse } from '../parser';
import type {
  Condition,
  ExprNode,
  FieldMetadata,
  FilterChipData,
  FilterOperator,
  FieldType,
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
   * @default "Search [object]..."
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
 * FilterField - Self-contained filter component
 * Handles autocomplete, parsing, and chip creation internally
 * Just pass fields config and it works!
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
  // Internal state
  const [inputText, setInputText] = useState('');
  const [menuState, setMenuState] = useState<MenuState>('closed');
  const [chips, setChips] = useState<FilterChipData[]>([]);
  const [selectedField, setSelectedField] = useState<FieldMetadata | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator | null>(null);
  const [isFocused, setIsFocused] = useState(false);

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

  // Auto-open field menu when focused and no chips
  useEffect(() => {
    if (isFocused && chips.length === 0 && menuState === 'closed' && inputText === '') {
      setMenuState('field');
    }
  }, [isFocused, chips.length, menuState, inputText]);

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    // Show field menu when typing
    if (text && !selectedField) {
      setMenuState('field');
    } else if (!text) {
      setMenuState('closed');
      setSelectedField(null);
      setSelectedOperator(null);
    }
  };

  // Handle field selection
  const handleFieldSelect = (field: FieldMetadata) => {
    setSelectedField(field);
    setInputText('');
    setMenuState('operator');
  };

  // Handle operator selection
  const handleOperatorSelect = (operator: FilterOperator) => {
    setSelectedOperator(operator);

    // Check if operator needs a value
    const noValueOps: FilterOperator[] = ['is_null', 'is_not_null'];

    if (noValueOps.includes(operator)) {
      // Create chip immediately for operators that don't need values
      createChip(selectedField!, operator, null);
      resetState();
    } else {
      setMenuState('value');
    }
  };

  // Handle value selection
  const handleValueSelect = (value: string | number | boolean) => {
    if (selectedField && selectedOperator) {
      createChip(selectedField, selectedOperator, value);
      resetState();
    }
  };

  // Create a chip and update expression
  const createChip = (field: FieldMetadata, operator: FilterOperator, value: string | number | boolean | null) => {
    const condition: Condition = {
      type: 'condition',
      field: field.name,
      operator,
      value,
    };

    const newChip: FilterChipData = {
      id: `chip-${Date.now()}`,
      variant: 'chip',
      attribute: field.label,
      operator: getOperatorLabel(operator, field.type),
      value: String(value ?? ''),
      error,
    };

    setChips([newChip]);
    onChange?.(condition);
  };

  // Reset state after chip creation
  const resetState = () => {
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    setMenuState('closed');
    inputRef.current?.focus();
  };

  // Handle chip removal
  const handleChipRemove = (chipId: string) => {
    setChips(chips.filter(c => c.id !== chipId));
    onChange?.(null);
  };

  // Handle clear all
  const handleClear = () => {
    setChips([]);
    setInputText('');
    setSelectedField(null);
    setSelectedOperator(null);
    setMenuState('closed');
    onChange?.(null);
    inputRef.current?.focus();
  };

  // Handle chip click (edit mode)
  const handleChipClick = (chipId: string) => {
    const chip = chips.find(c => c.id === chipId);
    if (!chip || chip.variant !== 'chip') return;

    // Find the field
    const field = fields.find(f => f.label === chip.attribute);
    if (field) {
      setSelectedField(field);
      setSelectedOperator(null);
      setChips([]);
      setMenuState('value');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace at start of input - remove last chip
    if (e.key === 'Backspace' && inputText === '' && chips.length > 0) {
      e.preventDefault();
      const lastChip = chips[chips.length - 1];
      if (lastChip) {
        handleChipRemove(lastChip.id);
      }
    }

    // Escape - close menus
    if (e.key === 'Escape') {
      setMenuState('closed');
    }
  };

  // Handle focus
  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    setIsFocused(true);
  };

  // Handle blur
  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    // Delay to allow menu clicks to register
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setMenuState('closed');
      }
    }, 200);
  };

  const hasChips = chips.length > 0;
  const visibleChips = chips.slice(0, 3);
  const hasMoreChips = chips.length > 3;

  return (
    <div
      ref={containerRef}
      className='relative inline-block'
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div
        className={cn(
          // Base styles
          'relative flex h-10 w-full max-w-[800px] items-center overflow-clip rounded-lg',
          'border border-border-primary bg-component-input-bg shadow-xs',
          // Hover styles
          !error && 'hover:border-component-border-input-hover',
          error && 'hover:shadow-[0px_0px_0px_3px_rgba(231,0,11,0.3)]',
          // Focus styles
          !error &&
            'focus-within:border-border-strong-primary focus-within:shadow-focus-ring-primary',
          // Error styles
          error && 'border-border-strong-danger',
          error &&
            'focus-within:border-border-strong-danger focus-within:shadow-[0px_0px_0px_3px_rgba(231,0,11,0.2)]',
          className,
        )}
        role='combobox'
        aria-expanded={menuState !== 'closed'}
        aria-invalid={error}
        data-slot='filter-field'
        {...props}
      >
        {/* Left side: chips and input */}
        <div
          className={cn(
            'flex flex-1 items-center gap-2 pr-1',
            hasChips ? 'pl-2' : 'pl-3',
          )}
        >
          {/* Chips */}
          {hasChips && (
            <div className='flex items-center gap-1'>
              {visibleChips.map(chip => (
                <div
                  key={chip.id}
                  className='shrink-0 cursor-pointer'
                  onClick={() => handleChipClick(chip.id)}
                >
                  <FilterChip
                    {...chip}
                    onRemove={() => handleChipRemove(chip.id)}
                  />
                </div>
              ))}
              {hasMoreChips && (
                <p className='pl-1 text-sm leading-5 text-text-secondary'>{placeholder}</p>
              )}
            </div>
          )}

          {/* Input field */}
          {!hasMoreChips && (
            <input
              ref={inputRef}
              type='text'
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={hasChips ? '' : placeholder}
              className={cn(
                'flex-1 bg-transparent outline-none',
                'text-sm leading-5 text-text-primary',
                'placeholder:text-text-secondary',
              )}
            />
          )}
        </div>

        {/* Right side: keyboard hint and clear button */}
        <div className='flex shrink-0 items-center gap-2 pr-3'>
          {showKeyboardHint && !hasChips && (
            <div className='flex items-center gap-0.5'>
              <kbd className='inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-component-border-hotkey bg-bg-surface-2 px-1 text-xs'>
                ⌘
              </kbd>
              <kbd className='inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-component-border-hotkey bg-bg-surface-2 px-1 text-xs'>
                K
              </kbd>
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

      {/* Menus */}
      {menuState === 'field' && (
        <div className='absolute top-full left-0 mt-1 z-50'>
          <FilterMainMenu
            fields={fields}
            open={true}
            onOpenChange={(open) => !open && setMenuState('closed')}
            onSelect={handleFieldSelect}
          />
        </div>
      )}

      {menuState === 'operator' && selectedField && (
        <div className='absolute top-full left-0 mt-1 z-50'>
          <FilterOperatorMenu
            fieldType={selectedField.type}
            open={true}
            onOpenChange={(open) => !open && setMenuState('closed')}
            onSelect={handleOperatorSelect}
          />
        </div>
      )}

      {menuState === 'value' && selectedField && selectedOperator && (
        <div className='absolute top-full left-0 mt-1 z-50'>
          <FilterValueMenu
            values={selectedField.values || []}
            open={true}
            onOpenChange={(open) => !open && setMenuState('closed')}
            onSelect={handleValueSelect}
          />
        </div>
      )}
    </div>
  );
};

FilterField.displayName = 'FilterField';
