import { useCallback, useEffect, useMemo, useState } from 'react';
import { CONNECTOR_ID_PATTERN, chipIdToConditionIndex } from '../../lib';
import type {
  ChipErrorSegment,
  Condition,
  ExprNode,
  FieldMetadata,
  FilterOperator,
} from '../../types';
import { buildChips } from './buildChips';
import { buildExpression, expressionToConditions } from './expression';

interface UseFilterInputExpressionOptions {
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
const DEFAULT_CONNECTOR: 'and' = 'and';

/** Remove the connector associated with a condition being deleted at `idx`. */
const removeConnectorAtConditionIndex = (
  connectors: Array<'and' | 'or'>,
  idx: number,
): Array<'and' | 'or'> => {
  const updated = [...connectors];
  if (idx === 0 && updated.length > 0) {
    updated.splice(0, 1);
  } else if (idx > 0 && idx - 1 < updated.length) {
    updated.splice(idx - 1, 1);
  }
  return updated;
};

/** Build a Condition object from input params */
const buildCondition = (
  field: FieldMetadata,
  operator: FilterOperator | undefined,
  value: string | number | boolean | null | Array<string | number | boolean>,
  error?: ChipErrorSegment,
  dateOrigin?: 'relative' | 'absolute',
): Condition => ({
  type: 'condition',
  field: field.name,
  ...(operator && { operator }),
  value,
  ...(error && { error }),
  ...(dateOrigin && { dateOrigin }),
});

/** Insert or update a condition in the conditions array */
const applyCondition = (
  conditions: Condition[],
  condition: Condition,
  editingChipId?: string | null,
  atIndex?: number,
): Condition[] => {
  if (editingChipId) {
    const idx = chipIdToConditionIndex(editingChipId);
    if (idx !== null && idx < conditions.length) {
      const updated = [...conditions];
      updated[idx] = condition;
      return updated;
    }
    return [...conditions, condition];
  }
  if (atIndex != null && atIndex >= 0 && atIndex < conditions.length) {
    const updated = [...conditions];
    updated.splice(atIndex, 0, condition);
    return updated;
  }
  return [...conditions, condition];
};

/** Add a connector when a new condition is inserted */
const addConnectorIfNeeded = (
  connectors: Array<'and' | 'or'>,
  newConditionsLength: number,
  editingChipId?: string | null,
  atIndex?: number,
  prevConditionsLength?: number,
): Array<'and' | 'or'> => {
  if (editingChipId || newConditionsLength <= 1) return connectors;

  if (
    atIndex != null &&
    atIndex >= 0 &&
    prevConditionsLength != null &&
    atIndex < prevConditionsLength
  ) {
    const connIdx = Math.max(0, atIndex - 1);
    const updated = [...connectors];
    updated.splice(connIdx, 0, DEFAULT_CONNECTOR);
    return updated;
  }

  const missing = newConditionsLength - 1 - connectors.length;
  return missing > 0
    ? [...connectors, ...new Array<'and'>(missing).fill(DEFAULT_CONNECTOR)]
    : connectors;
};

export const useFilterInputExpression = ({
  fields,
  value,
  onChange,
  error,
}: UseFilterInputExpressionOptions) => {
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

  const upsertCondition = useCallback(
    (
      field: FieldMetadata,
      operator: FilterOperator | undefined,
      val: string | number | boolean | null | Array<string | number | boolean>,
      editingChipId?: string | null,
      atIndex?: number,
      error?: ChipErrorSegment,
      dateOrigin?: 'relative' | 'absolute',
    ) => {
      const condition = buildCondition(field, operator, val, error, dateOrigin);

      setState(prev => {
        const newConditions = applyCondition(prev.conditions, condition, editingChipId, atIndex);
        const newConnectors = addConnectorIfNeeded(
          prev.connectors,
          newConditions.length,
          editingChipId,
          atIndex,
          prev.conditions.length,
        );

        const next = { conditions: newConditions, connectors: newConnectors };
        onChange?.(buildExpression(next.conditions, next.connectors));
        return next;
      });
    },
    [onChange],
  );

  const removeCondition = useCallback(
    (chipId: string) => {
      const idx = chipIdToConditionIndex(chipId);
      if (idx === null) return;

      setState(prev => {
        const newConditions = prev.conditions.filter((_, i) => i !== idx);
        const newConnectors = removeConnectorAtConditionIndex(prev.connectors, idx);

        const next = { conditions: newConditions, connectors: newConnectors };
        onChange?.(buildExpression(next.conditions, next.connectors));
        return next;
      });
    },
    [onChange],
  );

  const removeConditionAtIndex = useCallback(
    (idx: number) => {
      setState(prev => {
        if (idx < 0 || idx >= prev.conditions.length) return prev;
        const newConditions = prev.conditions.filter((_, i) => i !== idx);
        const newConnectors = removeConnectorAtConditionIndex(prev.connectors, idx);

        const next = { conditions: newConditions, connectors: newConnectors };
        onChange?.(buildExpression(next.conditions, next.connectors));
        return next;
      });
    },
    [onChange],
  );

  const clearAll = useCallback(() => {
    setState(EMPTY_STATE);
    onChange?.(null);
  }, [onChange]);

  const setConnectorValue = useCallback(
    (connectorId: string, value: 'and' | 'or') => {
      const match = connectorId.match(CONNECTOR_ID_PATTERN);
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
    },
    [onChange],
  );

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
