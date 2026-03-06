import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildExpression, chipIdToConditionIndex, expressionToConditions } from '../lib';
import { buildChips } from '../lib/buildChips';
import type { Condition, ExprNode, FieldMetadata, FilterOperator } from '../types';

interface UseQueryBarExpressionOptions {
  fields: FieldMetadata[];
  value?: ExprNode | null;
  onChange?: (expression: ExprNode | null) => void;
  error: boolean;
}

interface ExpressionState {
  conditions: Condition[];
  connectors: Array<'and' | 'or'>;
}

const EMPTY_STATE: ExpressionState = { conditions: [], connectors: [] };

export const useQueryBarExpression = ({ fields, value, onChange, error }: UseQueryBarExpressionOptions) => {
  const [state, setState] = useState<ExpressionState>(EMPTY_STATE);

  // Sync conditions with value prop (controlled mode)
  useEffect(() => {
    if (value !== undefined) {
      const result = expressionToConditions(value);
      setState({ conditions: result.conditions, connectors: result.connectors });
    }
  }, [value]);

  const chips = useMemo(
    () => buildChips(state.conditions, state.connectors, fields, error),
    [state.conditions, state.connectors, fields, error],
  );

  const upsertCondition = useCallback((
    field: FieldMetadata,
    operator: FilterOperator,
    val: string | number | boolean | null | Array<string | number | boolean>,
    editingChipId?: string | null,
    atIndex?: number,
  ) => {
    const condition: Condition = {
      type: 'condition',
      field: field.name,
      operator,
      value: val,
    };

    setState(prev => {
      let newConditions: Condition[];

      if (editingChipId) {
        const idx = chipIdToConditionIndex(editingChipId);
        if (idx !== null && idx < prev.conditions.length) {
          newConditions = [...prev.conditions];
          newConditions[idx] = condition;
        } else {
          newConditions = [...prev.conditions, condition];
        }
      } else if (atIndex != null && atIndex < prev.conditions.length) {
        newConditions = [...prev.conditions];
        newConditions.splice(atIndex, 0, condition);
      } else {
        newConditions = [...prev.conditions, condition];
      }

      let newConnectors = prev.connectors;

      // Add connector when inserting a new condition
      if (!editingChipId && newConditions.length > 1) {
        if (atIndex != null && atIndex < prev.conditions.length) {
          const connIdx = Math.max(0, atIndex - 1);
          const updated = [...prev.connectors];
          updated.splice(connIdx, 0, 'and');
          newConnectors = updated;
        } else {
          const missing = newConditions.length - 1 - prev.connectors.length;
          newConnectors = missing > 0
            ? [...prev.connectors, ...Array<'and'>(missing).fill('and')]
            : prev.connectors;
        }
      }

      const next = { conditions: newConditions, connectors: newConnectors };
      onChange?.(buildExpression(next.conditions, next.connectors));
      return next;
    });
  }, [onChange]);

  const removeCondition = useCallback((chipId: string) => {
    const idx = chipIdToConditionIndex(chipId);
    if (idx === null) return;

    setState(prev => {
      const newConditions = prev.conditions.filter((_, i) => i !== idx);
      const newConnectors = [...prev.connectors];
      if (idx === 0 && newConnectors.length > 0) {
        newConnectors.splice(0, 1);
      } else if (idx > 0 && idx - 1 < newConnectors.length) {
        newConnectors.splice(idx - 1, 1);
      }

      const next = { conditions: newConditions, connectors: newConnectors };
      onChange?.(buildExpression(next.conditions, next.connectors));
      return next;
    });
  }, [onChange]);

  const removeConditionAtIndex = useCallback((idx: number) => {
    setState(prev => {
      if (idx < 0 || idx >= prev.conditions.length) return prev;
      const newConditions = prev.conditions.filter((_, i) => i !== idx);
      const newConnectors = [...prev.connectors];
      if (idx === 0 && newConnectors.length > 0) {
        newConnectors.splice(0, 1);
      } else if (idx > 0 && idx - 1 < newConnectors.length) {
        newConnectors.splice(idx - 1, 1);
      }

      const next = { conditions: newConditions, connectors: newConnectors };
      onChange?.(buildExpression(next.conditions, next.connectors));
      return next;
    });
  }, [onChange]);

  const clearAll = useCallback(() => {
    setState(EMPTY_STATE);
    onChange?.(null);
  }, [onChange]);

  const setConnectorValue = useCallback((connectorId: string, value: 'and' | 'or') => {
    const match = connectorId.match(/^connector-(\d+)$/);
    if (!match) return;
    const condIdx = Number(match[1]);
    const connectorIdx = condIdx - 1;

    setState(prev => {
      const updated = [...prev.connectors];
      if (connectorIdx >= 0 && connectorIdx < updated.length) {
        updated[connectorIdx] = value;
      }
      const next = { conditions: prev.conditions, connectors: updated };
      onChange?.(buildExpression(next.conditions, next.connectors));
      return next;
    });
  }, [onChange]);

  return {
    conditions: state.conditions,
    connectors: state.connectors,
    chips,
    upsertCondition,
    removeCondition,
    removeConditionAtIndex,
    clearAll,
    setConnectorValue,
  };
};
