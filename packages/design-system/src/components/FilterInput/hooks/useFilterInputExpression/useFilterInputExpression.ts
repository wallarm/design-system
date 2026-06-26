import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  // Mirror of `state` kept in a ref so mutations read the latest value without a
  // functional `setState` updater. Calling `onChange` from inside an updater
  // fires the parent's setState during this component's render ("Cannot update a
  // component while rendering a different component"); computing the next state
  // here and emitting from the event handler avoids that.
  const stateRef = useRef<ExpressionState>(state);

  /** Commit the next state and (optionally) notify the consumer. Emitting is
   *  skipped for the controlled-value sync, which must not echo back. */
  const applyState = useCallback(
    (next: ExpressionState, emit: boolean) => {
      stateRef.current = next;
      setState(next);
      if (emit) onChange?.(buildExpression(next.conditions, next.connectors, fields));
    },
    [onChange, fields],
  );

  // Sync conditions with value prop (controlled mode). Re-derive value errors
  // so they survive a consumer round-trip that drops the `error` flag.
  useEffect(() => {
    if (value !== undefined) {
      const result = expressionToConditions(value, fields);
      const next: ExpressionState = {
        conditions: revalidateConditions(result.conditions, fields),
        connectors: result.connectors,
      };
      stateRef.current = next;
      setState(next);
    }
  }, [value, fields]);

  const chips = useMemo(
    () =>
      applyExternalErrors(
        buildChips(state.conditions, state.connectors, fields, error),
        state.conditions,
        externalErrors,
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
      side?: 0 | 1,
    ) => {
      const prev = stateRef.current;

      // Paired triplet: merge onto the target condition's `pair` instead of
      // replacing the base triplet. Target = the editing chip, or (while
      // building) the last condition.
      if (side === 1) {
        const idx =
          editingChipId != null
            ? chipIdToConditionIndex(editingChipId)
            : prev.conditions.length - 1;
        if (idx == null || idx < 0 || idx >= prev.conditions.length) return;
        const base = prev.conditions[idx]!;
        const updated = [...prev.conditions];
        updated[idx] = {
          ...base,
          pair: {
            ...(operator && { operator }),
            value: val,
            ...(error && { error }),
            ...(dateOrigin && { dateOrigin }),
          },
        };
        applyState({ conditions: updated, connectors: prev.connectors }, true);
        return;
      }

      const condition = buildCondition(field, operator, val, error, dateOrigin);
      // Editing the base side (side 0) of a paired chip rebuilds the condition
      // from scratch, which would drop the second triplet. Carry the existing
      // `pair` over when the field is unchanged (e.g. changing the key/value of
      // "context_param is header ; Value = x" must keep the Value part). A field
      // change is treated as a fresh condition, so its pair is intentionally not
      // preserved.
      if (editingChipId) {
        const idx = chipIdToConditionIndex(editingChipId);
        const prevCondition = idx !== null ? prev.conditions[idx] : undefined;
        if (prevCondition?.pair && prevCondition.field === condition.field) {
          condition.pair = prevCondition.pair;
        }
      }
      const newConditions = applyCondition(prev.conditions, condition, editingChipId, atIndex);
      const newConnectors = addConnectorIfNeeded(
        prev.connectors,
        newConditions.length,
        editingChipId,
        atIndex,
        prev.conditions.length,
      );
      applyState({ conditions: newConditions, connectors: newConnectors }, true);
    },
    [applyState],
  );

  const removeCondition = useCallback(
    (chipId: string) => {
      const idx = chipIdToConditionIndex(chipId);
      if (idx === null) return;

      const prev = stateRef.current;
      if (prev.conditions[idx]?.disabled) return;

      const newConditions = prev.conditions.filter((_, i) => i !== idx);
      const newConnectors = removeConnectorAtConditionIndex(prev.connectors, idx);
      applyState({ conditions: newConditions, connectors: newConnectors }, true);
    },
    [applyState],
  );

  const removeConditionAtIndex = useCallback(
    (idx: number) => {
      const prev = stateRef.current;
      if (idx < 0 || idx >= prev.conditions.length) return;
      if (prev.conditions[idx]?.disabled) return;

      const newConditions = prev.conditions.filter((_, i) => i !== idx);
      const newConnectors = removeConnectorAtConditionIndex(prev.connectors, idx);
      applyState({ conditions: newConditions, connectors: newConnectors }, true);
    },
    [applyState],
  );

  const clearAll = useCallback(() => {
    const prev = stateRef.current;
    const disabledConditions = prev.conditions.filter(c => c.disabled);
    if (disabledConditions.length === 0) {
      applyState(EMPTY_STATE, false);
      onChange?.(null);
      return;
    }
    // Keep disabled conditions and their connectors.
    applyState({ conditions: disabledConditions, connectors: [] }, true);
  }, [applyState, onChange]);

  /** Replace the entire expression (paste path). Mirrors the upsert/remove
   *  pattern so uncontrolled components stay in sync. */
  const replaceExpression = useCallback(
    (expr: ExprNode | null) => {
      const result = expressionToConditions(expr, fields);
      applyState({ conditions: result.conditions, connectors: result.connectors }, false);
      onChange?.(expr);
    },
    [applyState, onChange, fields],
  );

  const setConnectorValue = useCallback(
    (connectorId: string, value: 'and' | 'or') => {
      const match = connectorId.match(CONNECTOR_ID_PATTERN);
      if (!match) return;
      const condIdx = Number(match[1]);
      const connectorIdx = condIdx - 1;

      const prev = stateRef.current;
      const updated = [...prev.connectors];
      if (connectorIdx >= 0 && connectorIdx < updated.length) {
        updated[connectorIdx] = value;
      }
      applyState({ conditions: prev.conditions, connectors: updated }, true);
    },
    [applyState],
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
