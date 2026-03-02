import type { FC, KeyboardEvent, ChangeEvent } from 'react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { FilterField } from '../FilterField';
import { FilterMainMenu } from '../FilterMainMenu';
import { SegmentAttribute, SegmentOperator, SegmentValue } from '../segments';
import type { Condition, ExprNode, FieldMetadata, FilterChipData, FilterOperator } from '../types';
import { getOperatorLabel } from '../types';
import { parse } from './parser';

/**
 * Editing Context Types
 * Represents which part of the filter expression is currently being edited
 */
export type EditingContext = 'field' | 'operator' | 'value' | null;

/**
 * FilterComponent Props Interface
 */
export interface FilterComponentProps {
  /**
   * Available fields for filtering
   */
  fields: FieldMetadata[];
  /**
   * Controlled mode: Current filter expression
   */
  value?: ExprNode | null;
  /**
   * Callback when filter expression changes
   */
  onChange?: (expression: ExprNode | null, chips: FilterChipData[]) => void;
  /**
   * Placeholder text for empty input
   */
  placeholder?: string;
  /**
   * Whether to show keyboard hint (⌘K)
   */
  showKeyboardHint?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * FilterComponent Internal State Interface
 */
export interface FilterComponentState {
  /**
   * Current input text being typed
   */
  inputText: string;
  /**
   * Cursor position in the input
   */
  cursorPosition: number;
  /**
   * Current editing context (what the user is typing)
   */
  editingContext: EditingContext;
  /**
   * Parsed filter chips for display
   */
  chips: FilterChipData[];
  /**
   * Parsed expression tree
   */
  expression: ExprNode | null;
}

/**
 * FilterComponent
 *
 * Main component that combines text input, autocomplete dropdowns, visual filter chips,
 * and intelligent expression parsing. Users can build complex filter queries using both
 * GUI (dropdowns) and text input (parsing).
 */
export const FilterComponent: FC<FilterComponentProps> = ({
  fields,
  value,
  onChange,
  placeholder = 'Type to filter...',
  showKeyboardHint = true,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Internal state
  const [state, setState] = useState<FilterComponentState>({
    inputText: '',
    cursorPosition: 0,
    editingContext: null,
    chips: [],
    expression: null,
  });

  // Dropdown visibility state
  const [showFieldMenu, setShowFieldMenu] = useState(false);

  // Sync controlled value to internal state
  useEffect(() => {
    if (value !== undefined) {
      // TODO: Convert ExprNode to chips when controlled mode is used
      // This will be implemented when parser is ready
    }
  }, [value]);

  /**
   * Convert parsed expression to filter chips
   */
  const expressionToChips = useCallback((expression: ExprNode | null): FilterChipData[] => {
    if (!expression) {
      return [];
    }

    // For now, only handle single Condition nodes (US-002)
    // Will be extended for AND/OR/parentheses in US-009-011
    if (expression.type === 'condition') {
      const condition = expression as Condition;
      return [
        {
          id: `chip-${Date.now()}`,
          variant: 'chip',
          attribute: condition.field,
          operator: condition.operator,
          value: String(condition.value),
        },
      ];
    }

    return [];
  }, []);

  /**
   * Parse input text to expression and chips
   */
  const parseInput = useCallback(
    (text: string): { expression: ExprNode | null; chips: FilterChipData[] } => {
      const result = parse(text);

      if (!result.expression) {
        return {
          expression: null,
          chips: [],
        };
      }

      const chips = expressionToChips(result.expression);

      return {
        expression: result.expression,
        chips,
      };
    },
    [expressionToChips],
  );

  /**
   * Handle input text change
   */
  const handleInputChange = useCallback(
    (text: string) => {
      const { expression, chips } = parseInput(text);

      setState(prev => ({
        ...prev,
        inputText: text,
        expression,
        chips,
        editingContext: text.trim() === '' || !expression ? 'field' : null,
      }));

      // Show field menu when typing and no complete expression yet
      if (text.trim() !== '' && !expression) {
        setShowFieldMenu(true);
      } else {
        setShowFieldMenu(false);
      }

      // Emit onChange event
      onChange?.(expression, chips);
    },
    [parseInput, onChange],
  );

  /**
   * Handle text input from user typing
   */
  const handleTextInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleInputChange(event.target.value);
    },
    [handleInputChange],
  );

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        setShowFieldMenu(false);
      }
      // Arrow keys and Enter are handled by FilterMainMenu
    },
    [],
  );

  /**
   * Handle cursor position change
   * Used to determine editing context for autocomplete
   */
  const handleCursorMove = useCallback((position: number) => {
    setState(prev => ({
      ...prev,
      cursorPosition: position,
    }));

    // TODO: Determine editing context based on cursor position
    // This will be implemented when autocomplete is added (US-005-007)
  }, []);

  /**
   * Handle chip removal
   */
  const handleChipRemove = useCallback(
    (chipId: string) => {
      // TODO: Remove chip and update expression
      // This will be implemented when chip editing is added (US-017)
      const updatedChips = state.chips.filter(chip => chip.id !== chipId);
      setState(prev => ({
        ...prev,
        chips: updatedChips,
      }));

      onChange?.(state.expression, updatedChips);
    },
    [state.chips, state.expression, onChange],
  );

  /**
   * Handle clear all
   */
  const handleClear = useCallback(() => {
    setState({
      inputText: '',
      cursorPosition: 0,
      editingContext: null,
      chips: [],
      expression: null,
    });

    onChange?.(null, []);
  }, [onChange]);

  /**
   * Handle field selection from FilterMainMenu
   */
  const handleFieldSelect = useCallback(
    (field: FieldMetadata) => {
      // Update input text with selected field name + space for operator
      const newText = `${field.name} `;
      handleInputChange(newText);
      setShowFieldMenu(false);

      // Focus back on input
      inputRef.current?.focus();
    },
    [handleInputChange],
  );

  /**
   * Handle field focus - set initial editing context
   */
  const handleFocus = useCallback(() => {
    if (state.inputText === '') {
      setState(prev => ({
        ...prev,
        editingContext: 'field',
      }));
      setShowFieldMenu(true);
    }
  }, [state.inputText]);

  /**
   * Get field type for a field name
   * TODO: This will use the fields prop metadata in future stories
   */
  const getFieldType = useCallback(
    (fieldName: string) => {
      const field = fields.find(f => f.name === fieldName);
      return field?.type ?? 'string';
    },
    [fields],
  );

  // Filter fields based on current input
  const filteredFields = fields.filter(field =>
    field.label.toLowerCase().includes(state.inputText.toLowerCase()) ||
    field.name.toLowerCase().includes(state.inputText.toLowerCase()),
  );

  return (
    <div className='relative w-full'>
      {/* Wrapper combining FilterField visual and input */}
      <div className='relative'>
        {state.chips.length === 0 ? (
          // When no chips, show input directly
          <div className='relative'>
            <input
              ref={inputRef}
              type='text'
              value={state.inputText}
              onChange={handleTextInput}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder={placeholder}
              className='h-10 w-full max-w-[800px] rounded-lg border border-border-primary bg-component-input-bg px-3 py-2 text-sm shadow-xs placeholder:text-text-tertiary focus:border-border-strong-primary focus:shadow-focus-ring-primary focus:outline-none'
            />
          </div>
        ) : (
          // When chips exist, show FilterField with chips and hidden input for continued typing
          <>
            <FilterField
              chips={state.chips.map(chip => {
                if (!chip.attribute || !chip.operator) {
                  return {
                    id: chip.id,
                    content: null,
                  };
                }

                const fieldType = getFieldType(chip.attribute);
                const operatorLabel = getOperatorLabel(chip.operator as FilterOperator, fieldType);

                return {
                  id: chip.id,
                  content: (
                    <>
                      <SegmentAttribute>{chip.attribute}</SegmentAttribute>
                      <SegmentOperator>{operatorLabel}</SegmentOperator>
                      <SegmentValue>{chip.value ?? ''}</SegmentValue>
                    </>
                  ),
                };
              })}
              placeholder={placeholder}
              showKeyboardHint={showKeyboardHint}
              onChipRemove={handleChipRemove}
              onClear={handleClear}
              className={className}
            />
            <input
              ref={inputRef}
              type='text'
              value={state.inputText}
              onChange={handleTextInput}
              onKeyDown={handleKeyDown}
              className='absolute top-0 left-0 opacity-0 pointer-events-none'
              aria-hidden='true'
            />
          </>
        )}
      </div>

      {/* FilterMainMenu dropdown */}
      {showFieldMenu && filteredFields.length > 0 && (
        <div className='absolute top-full left-0 mt-1 z-50'>
          <FilterMainMenu
            fields={filteredFields}
            onSelect={handleFieldSelect}
            open={showFieldMenu}
            onOpenChange={setShowFieldMenu}
          />
        </div>
      )}
    </div>
  );
};

FilterComponent.displayName = 'FilterComponent';
