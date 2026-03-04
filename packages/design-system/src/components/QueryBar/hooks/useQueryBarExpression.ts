import { useEffect, useMemo, useState } from 'react';
import { buildExpression, chipIdToConditionIndex, expressionToConditions } from '../lib';
import { getDateDisplayLabel, getOperatorLabel } from '../lib';
import type { Condition, ExprNode, FieldMetadata, QueryBarChipData, FilterOperator } from '../types';

interface UseQueryBarExpressionOptions {
  fields: FieldMetadata[];
  value?: ExprNode | null;
  onChange?: (expression: ExprNode | null) => void;
  error: boolean;
}

export const useQueryBarExpression = ({ fields, value, onChange, error }: UseQueryBarExpressionOptions) => {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [connectors, setConnectors] = useState<Array<'and' | 'or'>>([]);

  // Sync conditions with value prop (controlled mode)
  useEffect(() => {
    if (value !== undefined) {
      const result = expressionToConditions(value);
      setConditions(result.conditions);
      setConnectors(result.connectors);
    }
  }, [value]);

  // Derive display chips from conditions + connectors.
  // When AND and OR are mixed, AND-groups of 2+ conditions get wrapped in parentheses.
  const chips = useMemo((): QueryBarChipData[] => {
    if (conditions.length === 0) return [];

    const makeConditionChip = (i: number): QueryBarChipData => {
      const condition = conditions[i]!;
      const field = fields.find(f => f.name === condition.field);

      let displayValue: string;
      if (field?.type === 'date') {
        if (Array.isArray(condition.value)) {
          displayValue = condition.value.map(v => getDateDisplayLabel(String(v))).join(' – ');
        } else {
          displayValue = getDateDisplayLabel(String(condition.value ?? ''));
        }
      } else if (Array.isArray(condition.value)) {
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

      return {
        id: `chip-${i}`,
        variant: 'chip',
        attribute: field?.label || condition.field,
        operator: getOperatorLabel(condition.operator, field?.type || 'string'),
        value: displayValue,
        error,
      };
    };

    const hasMixed = connectors.includes('and') && connectors.includes('or');

    if (!hasMixed) {
      // All same operator — flat list, no parentheses needed
      const result: QueryBarChipData[] = [];
      for (let i = 0; i < conditions.length; i++) {
        if (i > 0) {
          result.push({ id: `connector-${i}`, variant: connectors[i - 1] ?? 'and', error });
        }
        result.push(makeConditionChip(i));
      }
      return result;
    }

    // Mixed AND/OR — split into AND-groups, wrap groups of 2+ in parentheses
    const groups: number[][] = [[0]]; // groups of condition indices
    for (let i = 0; i < connectors.length; i++) {
      if (connectors[i] === 'or') {
        groups.push([i + 1]);
      } else {
        groups[groups.length - 1].push(i + 1);
      }
    }

    const result: QueryBarChipData[] = [];
    let parenCounter = 0;

    for (let g = 0; g < groups.length; g++) {
      if (g > 0) {
        // OR connector between groups — use the condition index of the first item in the group
        const firstIdx = groups[g][0];
        result.push({ id: `connector-${firstIdx}`, variant: 'or', error });
      }

      const group = groups[g];
      const needsParens = group.length > 1;

      if (needsParens) {
        result.push({ id: `paren-open-${parenCounter}`, variant: '(', error });
      }

      for (let j = 0; j < group.length; j++) {
        const condIdx = group[j];
        if (j > 0) {
          result.push({ id: `connector-${condIdx}`, variant: 'and', error });
        }
        result.push(makeConditionChip(condIdx));
      }

      if (needsParens) {
        result.push({ id: `paren-close-${parenCounter}`, variant: ')', error });
        parenCounter++;
      }
    }

    return result;
  }, [conditions, connectors, fields, error]);

  const upsertCondition = (
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
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

      // Add default connector when appending a new condition
      if (!editingChipId && newConditions.length > 1) {
        setConnectors(c => {
          const updated = [...c];
          while (updated.length < newConditions.length - 1) {
            updated.push('and');
          }
          return updated;
        });
      }

      const expr = buildExpression(newConditions, connectors.length >= newConditions.length - 1
        ? connectors
        : [...connectors, 'and']);
      onChange?.(expr);

      return newConditions;
    });
  };

  const removeCondition = (chipId: string) => {
    const idx = chipIdToConditionIndex(chipId);
    if (idx === null) return;

    setConditions(prev => {
      const newConditions = prev.filter((_, i) => i !== idx);

      // Remove the connector associated with this condition
      setConnectors(c => {
        const updated = [...c];
        if (idx === 0 && updated.length > 0) {
          // Removing first condition: remove first connector
          updated.splice(0, 1);
        } else if (idx > 0 && idx - 1 < updated.length) {
          // Removing non-first: remove connector before it
          updated.splice(idx - 1, 1);
        }
        return updated;
      });

      const newConnectors = [...connectors];
      if (idx === 0 && newConnectors.length > 0) {
        newConnectors.splice(0, 1);
      } else if (idx > 0 && idx - 1 < newConnectors.length) {
        newConnectors.splice(idx - 1, 1);
      }

      const expr = buildExpression(newConditions, newConnectors);
      onChange?.(expr);
      return newConditions;
    });
  };

  const removeLastCondition = () => {
    setConditions(prev => {
      const newConditions = prev.slice(0, -1);
      const newConnectors = connectors.slice(0, -1);
      setConnectors(newConnectors);
      const expr = buildExpression(newConditions, newConnectors);
      onChange?.(expr);
      return newConditions;
    });
  };

  const clearAll = () => {
    setConditions([]);
    setConnectors([]);
    onChange?.(null);
  };

  const toggleConnector = (connectorId: string) => {
    const match = connectorId.match(/^connector-(\d+)$/);
    if (!match) return;
    const condIdx = Number(match[1]);
    const connectorIdx = condIdx - 1;

    setConnectors(prev => {
      const updated = [...prev];
      if (connectorIdx >= 0 && connectorIdx < updated.length) {
        updated[connectorIdx] = updated[connectorIdx] === 'and' ? 'or' : 'and';
      }
      const expr = buildExpression(conditions, updated);
      onChange?.(expr);
      return updated;
    });
  };

  return {
    conditions,
    connectors,
    chips,
    upsertCondition,
    removeCondition,
    removeLastCondition,
    clearAll,
    toggleConnector,
  };
};
