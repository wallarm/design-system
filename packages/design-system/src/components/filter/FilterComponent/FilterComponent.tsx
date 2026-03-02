import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { FilterField } from '../FilterField';
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
  // Internal state
  const [state, setState] = useState<FilterComponentState>({
    inputText: '',
    cursorPosition: 0,
    editingContext: null,
    chips: [],
    expression: null,
  });

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
      }));

      // Emit onChange event
      onChange?.(expression, chips);
    },
    [parseInput, onChange],
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
   * Handle field focus - set initial editing context
   */
  const handleFocus = useCallback(() => {
    if (state.inputText === '') {
      setState(prev => ({
        ...prev,
        editingContext: 'field',
      }));
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

  return (
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
      onClear={state.chips.length > 0 ? handleClear : undefined}
      onFocus={handleFocus}
      className={className}
    />
  );
};

FilterComponent.displayName = 'FilterComponent';
