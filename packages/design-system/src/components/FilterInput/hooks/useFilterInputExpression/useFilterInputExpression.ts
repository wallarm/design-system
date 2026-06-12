import { useCallback, useEffect, useMemo, useState } from 'react';
import { SEGMENT_VARIANT } from '../../FilterInputField/FilterInputChip';
import { CONNECTOR_ID_PATTERN, chipIdToConditionIndex, validateValueForField } from '../../lib';
import type {
  ChipErrorSegment,
  Condition,
  ExprNode,
  FieldMetadata,
  FilterOperator,
} from '../../types';
import { applyExternalErrors } from './applyExternalErrors';
import { buildChips } from './buildChips';
import { buildExpression, expressionToConditions } from './expression';

interface UseFilterInputExpressionOptions {
  fields: FieldMetadata[];
  value?: ExprNode | null;
  onChange?: (expression: ExprNode | null) => void;
  error: boolean;
  externalErrors?: string[];
}

interface ExpressionState {
  conditions: Condition[];
  connectors: Array<'and' | 'or'>;
}

const EMPTY_STATE: ExpressionState = { conditions: [], connectors: [] };
const DEFAULT_CONNECTOR: 'and' = 'and';

/**
 * Re-derive each condition's `value` error from its field's allowlist.
 *
 * The `error` flag lives on the Condition, so any consumer that round-trips the
 * expression through a domain type without an `error` slot (e.g. a backend query
 * shape) drops it — and the controlled re-sync would then render the chip as
 * valid. Recomputing on sync keeps the error robust to round-trips and also
 * surfaces invalid values arriving from any source (initial load, share-links).
 *
 * Pure and idempotent. `validateValueForField` is the single source of truth —
 * it covers `validate` callbacks, static allowlists, and the data type of plain
 * freeform fields. Only pure-dynamic (`getSuggestions`, no validator) fields are
 * skipped: their suggestion list is a hint, not an allowlist, so the `error`
 * flag is consumer-owned. Unknown-field (`attribute`) errors and disabled
 * conditions are likewise left untouched.
 */
const revalidateConditions = (conditions: Condition[], fields: FieldMetadata[]): Condition[] =>
  conditions.map(condition => {
    if (condition.disabled) return condition;
    const field = fields.find(f => f.name === condition.field);
    // Unknown field — the attribute error is owned by the field-commit path.
    if (!field || condition.error === SEGMENT_VARIANT.attribute) return condition;
    // Pure-dynamic field — validity is consumer-owned; leave the flag as-is.
    if (field.getSuggestions && !field.validate) return condition;

    if (validateValueForField(field, condition.value)) {
      return condition.error === SEGMENT_VARIANT.value
        ? condition
        : { ...condition, error: SEGMENT_VARIANT.value };
    }
    // Value is valid now — drop a stale value error if one was set.
    if (condition.error === SEGMENT_VARIANT.value) {
      const next = { ...condition };
      delete next.error;
      return next;
    }
    return condition;
  });

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
  externalErrors,
}: UseFilterInputExpressionOptions) => {
  const [state, setState] = useState<ExpressionState>(EMPTY_STATE);

  // Sync conditions with value prop (controlled mode). Re-derive value errors
  // so they survive a consumer round-trip that drops the `error` flag.
  useEffect(() => {
    if (value !== undefined) {
      const result = expressionToConditions(value);
      setState({
        conditions: revalidateConditions(result.conditions, fields),
        connectors: result.connectors,
      });
    }
  }, [value, fields]);

  const chips = useMemo(
    () =>
      buildChips(
        applyExternalErrors(state.conditions, externalErrors),
        state.connectors,
        fields,
        error,
      ),
    [state.conditions, state.connectors, fields, error, externalErrors],
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
        if (prev.conditions[idx]?.disabled) return prev;

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
        if (prev.conditions[idx]?.disabled) return prev;
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
    setState(prev => {
      const disabledConditions = prev.conditions.filter(c => c.disabled);
      if (disabledConditions.length === 0) {
        onChange?.(null);
        return EMPTY_STATE;
      }
      // Keep disabled conditions and their connectors.
      const next = { conditions: disabledConditions, connectors: [] as Array<'and' | 'or'> };
      onChange?.(buildExpression(next.conditions, next.connectors));
      return next;
    });
  }, [onChange]);

  /** Replace the entire expression (paste path). Mirrors the upsert/remove
   *  pattern so uncontrolled components stay in sync. */
  const replaceExpression = useCallback(
    (expr: ExprNode | null) => {
      const result = expressionToConditions(expr);
      setState({ conditions: result.conditions, connectors: result.connectors });
      onChange?.(expr);
    },
    [onChange],
  );

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
    replaceExpression,
    setConnectorValue,
  };
};
