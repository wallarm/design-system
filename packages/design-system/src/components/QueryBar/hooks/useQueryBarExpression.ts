import { useEffect, useMemo, useState } from 'react';
import { buildExpression, chipIdToConditionIndex, expressionToConditions } from '../lib';
import { buildChips } from '../lib/buildChips';
import type { Condition, ExprNode, FieldMetadata, FilterOperator } from '../types';

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

  const chips = useMemo(
    () => buildChips(conditions, connectors, fields, error),
    [conditions, connectors, fields, error],
  );

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
          const missing = newConditions.length - 1 - c.length;
          return missing > 0 ? [...c, ...Array<'and'>(missing).fill('and')] : c;
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
      const spliceConnectors = (c: Array<'and' | 'or'>) => {
        const updated = [...c];
        if (idx === 0 && updated.length > 0) {
          updated.splice(0, 1);
        } else if (idx > 0 && idx - 1 < updated.length) {
          updated.splice(idx - 1, 1);
        }
        return updated;
      };

      setConnectors(spliceConnectors);

      const expr = buildExpression(newConditions, spliceConnectors(connectors));
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
