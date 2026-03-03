import { useEffect, useMemo, useState } from 'react';
import type { Condition, ExprNode, FieldMetadata, FilterChipData, FilterOperator } from '../../types';
import { getOperatorLabel } from '../../types';
import { buildExpression, chipIdToConditionIndex, expressionToConditions } from '../expression';

interface UseFilterExpressionOptions {
  fields: FieldMetadata[];
  value?: ExprNode | null;
  onChange?: (expression: ExprNode | null) => void;
  error: boolean;
}

export const useFilterExpression = ({ fields, value, onChange, error }: UseFilterExpressionOptions) => {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [connectorOperator, setConnectorOperator] = useState<'and' | 'or'>('and');

  // Sync conditions with value prop (controlled mode)
  useEffect(() => {
    if (value !== undefined) {
      const { conditions: newConditions, connector } = expressionToConditions(value);
      setConditions(newConditions);
      setConnectorOperator(connector);
    }
  }, [value]);

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

      const expr = buildExpression(newConditions, connectorOperator);
      onChange?.(expr);

      return newConditions;
    });
  };

  const removeCondition = (chipId: string) => {
    const idx = chipIdToConditionIndex(chipId);
    if (idx === null) return;

    setConditions(prev => {
      const newConditions = prev.filter((_, i) => i !== idx);
      const expr = buildExpression(newConditions, connectorOperator);
      onChange?.(expr);
      return newConditions;
    });
  };

  const removeLastCondition = () => {
    setConditions(prev => {
      const newConditions = prev.slice(0, -1);
      const expr = buildExpression(newConditions, connectorOperator);
      onChange?.(expr);
      return newConditions;
    });
  };

  const clearAll = () => {
    setConditions([]);
    setConnectorOperator('and');
    onChange?.(null);
  };

  const toggleConnector = () => {
    setConnectorOperator(prev => {
      const next = prev === 'and' ? 'or' : 'and';
      const expr = buildExpression(conditions, next);
      onChange?.(expr);
      return next;
    });
  };

  return {
    conditions,
    connectorOperator,
    chips,
    upsertCondition,
    removeCondition,
    removeLastCondition,
    clearAll,
    toggleConnector,
  };
};
