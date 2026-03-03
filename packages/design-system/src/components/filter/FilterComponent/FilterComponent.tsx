import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FilterField } from '../FilterField';
import { FilterMainMenu } from '../FilterMainMenu';
import { FilterOperatorMenu } from '../FilterOperatorMenu';
import { FilterValueMenu } from '../FilterValueMenu';
import { SegmentAttribute, SegmentOperator, SegmentValue } from '../segments';
import type { Condition, ExprNode, FieldMetadata, FilterChipData, FilterOperator } from '../types';
import { getOperatorLabel, OPERATORS_BY_TYPE } from '../types';
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
  const [showOperatorMenu, setShowOperatorMenu] = useState(false);
  const [showValueMenu, setShowValueMenu] = useState(false);

  // Current field being edited (for operator/value menus)
  const [currentField, setCurrentField] = useState<FieldMetadata | null>(null);

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
   * Determine what the user is currently typing based on input analysis
   */
  const analyzeInput = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return { context: 'field' as const, field: null, hasOperator: false, hasValue: false };
      }

      // Try to match a field name
      const matchedField = fields.find(f => trimmed.startsWith(f.name));
      if (!matchedField) {
        return { context: 'field' as const, field: null, hasOperator: false, hasValue: false };
      }

      // Check if there's text after the field name
      const afterField = trimmed.slice(matchedField.name.length).trim();
      if (!afterField) {
        return {
          context: 'field' as const,
          field: matchedField,
          hasOperator: false,
          hasValue: false,
        };
      }

      // Check if there's an operator
      const operators = ['>=', '<=', '!=', '=', '>', '<', 'like', 'not_like'];
      let foundOp = null;
      for (const op of operators) {
        if (afterField.startsWith(op)) {
          foundOp = op;
          break;
        }
      }

      if (!foundOp) {
        return {
          context: 'operator' as const,
          field: matchedField,
          hasOperator: false,
          hasValue: false,
        };
      }

      // Check if there's text after operator
      const afterOp = afterField.slice(foundOp.length).trim();
      if (!afterOp) {
        return {
          context: 'value' as const,
          field: matchedField,
          hasOperator: true,
          hasValue: false,
        };
      }

      return {
        context: 'value' as const,
        field: matchedField,
        hasOperator: true,
        hasValue: true,
      };
    },
    [fields],
  );

  /**
   * Handle input text change
   */
  const handleInputChange = useCallback(
    (text: string) => {
      const parseResult = parse(text);
      const { expression, isComplete } = parseResult;

      // If expression is complete, create chip and clear input
      if (isComplete && expression) {
        const chips = expressionToChips(expression);
        setState(prev => ({
          ...prev,
          inputText: '',
          expression,
          chips,
          editingContext: null,
        }));
        setShowFieldMenu(false);
        setShowOperatorMenu(false);
        setShowValueMenu(false);
        setCurrentField(null);
        onChange?.(expression, chips);
        return;
      }

      // Analyze what user is typing
      const analysis = analyzeInput(text);

      setState(prev => ({
        ...prev,
        inputText: text,
        expression: null,
        editingContext: analysis.context,
      }));

      // Show appropriate menu based on context
      if (analysis.context === 'field') {
        setShowFieldMenu(text.trim() !== '');
        setShowOperatorMenu(false);
        setShowValueMenu(false);
        setCurrentField(analysis.field);
      } else if (analysis.context === 'operator') {
        setShowFieldMenu(false);
        setShowOperatorMenu(true);
        setShowValueMenu(false);
        setCurrentField(analysis.field);
      } else if (analysis.context === 'value') {
        setShowFieldMenu(false);
        setShowOperatorMenu(false);
        setShowValueMenu(true);
        setCurrentField(analysis.field);
      }

      onChange?.(null, state.chips);
    },
    [parse, parseInput, expressionToChips, analyzeInput, onChange, state.chips],
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
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setShowFieldMenu(false);
    }
    // Arrow keys and Enter are handled by FilterMainMenu
  }, []);

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
   * Handle chip click for editing
   */
  const handleChipClick = useCallback(
    (chipId: string) => {
      // Find the chip being edited
      const chip = state.chips.find(c => c.id === chipId);
      if (!chip || !chip.attribute || !chip.operator) {
        return;
      }

      // Convert chip back to text format
      const chipText = `${chip.attribute} ${chip.operator} ${chip.value ?? ''}`;

      // Remove the chip from the list
      const updatedChips = state.chips.filter(c => c.id !== chipId);

      // Set the text in input and show value menu (most common edit case)
      setState(prev => ({
        ...prev,
        inputText: chipText,
        chips: updatedChips,
        editingContext: 'value',
      }));

      // Find the field to show appropriate dropdown
      const field = fields.find(f => f.name === chip.attribute);
      if (field) {
        setCurrentField(field);
        setShowFieldMenu(false);
        setShowOperatorMenu(false);
        setShowValueMenu(true);
      }

      // Focus the input
      inputRef.current?.focus();

      onChange?.(null, updatedChips);
    },
    [state.chips, fields, onChange],
  );

  /**
   * Handle chip removal
   */
  const handleChipRemove = useCallback(
    (chipId: string) => {
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
      setCurrentField(field);
      handleInputChange(newText);

      // Focus back on input
      inputRef.current?.focus();
    },
    [handleInputChange],
  );

  /**
   * Handle operator selection from FilterOperatorMenu
   */
  const handleOperatorSelect = useCallback(
    (operator: FilterOperator) => {
      if (!currentField) return;

      // Update input text with field + operator + space for value
      const newText = `${currentField.name} ${operator} `;
      handleInputChange(newText);

      // Focus back on input
      inputRef.current?.focus();
    },
    [currentField, handleInputChange],
  );

  /**
   * Handle value selection from FilterValueMenu
   */
  const handleValueSelect = useCallback(
    (value: string | number | boolean) => {
      if (!currentField) return;

      // Get the current input and append the value
      // This will complete the expression
      const newText = `${state.inputText}${value}`;
      handleInputChange(newText);

      // Focus back on input
      inputRef.current?.focus();
    },
    [currentField, state.inputText, handleInputChange],
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
  const filteredFields = fields.filter(
    field =>
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
              onChipClick={handleChipClick}
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

      {/* FilterOperatorMenu dropdown */}
      {showOperatorMenu && currentField && (
        <div className='absolute top-full left-0 mt-1 z-50'>
          <FilterOperatorMenu
            fieldType={currentField.type}
            selectedOperator={undefined}
            onSelect={handleOperatorSelect}
            open={showOperatorMenu}
            onOpenChange={setShowOperatorMenu}
          />
        </div>
      )}

      {/* FilterValueMenu dropdown */}
      {showValueMenu && currentField && currentField.values && currentField.values.length > 0 && (
        <div className='absolute top-full left-0 mt-1 z-50'>
          <FilterValueMenu
            values={currentField.values}
            onSelect={handleValueSelect}
            open={showValueMenu}
            onOpenChange={setShowValueMenu}
          />
        </div>
      )}
    </div>
  );
};

FilterComponent.displayName = 'FilterComponent';
