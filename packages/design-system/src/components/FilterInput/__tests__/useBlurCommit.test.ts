import { useRef } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBlurCommit } from '../hooks/useFilterInputAutocomplete/useBlurCommit';
import type { FieldMetadata, FilterOperator } from '../types';

const field: FieldMetadata = { name: 'status', label: 'Status', type: 'string' };
const operator: FilterOperator = '=';

const setupHook = (
  overrides: {
    selectedField?: FieldMetadata | null;
    selectedOperator?: FilterOperator | null;
    inputText?: string;
    editingChipId?: string | null;
    upsertCondition?: ReturnType<typeof vi.fn>;
    handleCustomValueCommit?: ReturnType<typeof vi.fn>;
    resetState?: ReturnType<typeof vi.fn>;
  } = {},
) => {
  const upsertCondition = overrides.upsertCondition ?? vi.fn();
  const handleCustomValueCommit = overrides.handleCustomValueCommit ?? vi.fn();
  const resetState = overrides.resetState ?? vi.fn();

  // Use `in` so that explicit `null` overrides win over the default —
  // `?? default` would silently coerce the explicit `null` back to default.
  const selectedField = 'selectedField' in overrides ? overrides.selectedField! : field;
  const selectedOperator = 'selectedOperator' in overrides ? overrides.selectedOperator! : operator;
  const inputText = 'inputText' in overrides ? overrides.inputText! : '';
  const editingChipId = 'editingChipId' in overrides ? overrides.editingChipId! : null;

  const { result } = renderHook(() => {
    const effectiveInsertIndexRef = useRef(0);
    const commitBuildingOnBlurRef = useRef<() => boolean>(() => false);
    return useBlurCommit({
      selectedField,
      selectedOperator,
      inputText,
      editingChipId,
      effectiveInsertIndexRef,
      handleCustomValueCommit,
      upsertCondition,
      resetState,
      commitBuildingOnBlurRef,
    });
  });

  return {
    commit: result.current.commitBuildingOnBlur,
    hasIncompleteBuilding: result.current.hasIncompleteBuilding,
    upsertCondition,
    handleCustomValueCommit,
    resetState,
  };
};

describe('useBlurCommit', () => {
  it('returns false and does nothing when no field is selected', () => {
    const { commit, upsertCondition, resetState } = setupHook({ selectedField: null });
    expect(commit()).toBe(false);
    expect(upsertCondition).not.toHaveBeenCalled();
    expect(resetState).not.toHaveBeenCalled();
  });

  it('returns false and does nothing when editing an existing chip', () => {
    const { commit, upsertCondition, resetState } = setupHook({ editingChipId: 'chip-0' });
    expect(commit()).toBe(false);
    expect(upsertCondition).not.toHaveBeenCalled();
    expect(resetState).not.toHaveBeenCalled();
  });

  it('commits as custom value when operator + text are present', () => {
    const handleCustomValueCommit = vi.fn();
    const upsertCondition = vi.fn();
    const { commit } = setupHook({
      selectedOperator: operator,
      inputText: 'foo',
      handleCustomValueCommit,
      upsertCondition,
    });

    expect(commit()).toBe(true);
    expect(handleCustomValueCommit).toHaveBeenCalledTimes(1);
    expect(handleCustomValueCommit).toHaveBeenCalledWith('foo');
    expect(upsertCondition).not.toHaveBeenCalled();
  });

  // AS-970 behavior switch: blur on an incomplete chip no longer commits it
  // as errored. The chip is preserved in `building` state (selectedField /
  // selectedOperator stay), and resetState is skipped by the caller because
  // `hasIncompleteBuilding()` is true.
  it('returns false and preserves state when there is no operator or no text', () => {
    const upsertCondition = vi.fn();
    const resetState = vi.fn();
    const { commit, hasIncompleteBuilding } = setupHook({
      selectedOperator: null,
      inputText: '',
      upsertCondition,
      resetState,
    });

    expect(commit()).toBe(false);
    expect(upsertCondition).not.toHaveBeenCalled();
    expect(resetState).not.toHaveBeenCalled();
    // Caller uses this to skip its own resetState — building chip survives.
    expect(hasIncompleteBuilding()).toBe(true);
  });

  // No-value operators (is_null / is_not_null) — semantically complete with
  // just attribute + operator, so blur commits them cleanly (the chip shows
  // a value-placeholder for the third slot).
  it('commits cleanly when the operator is a no-value operator', () => {
    const upsertCondition = vi.fn();
    const resetState = vi.fn();
    const { commit } = setupHook({
      selectedOperator: 'is_null',
      inputText: '',
      upsertCondition,
      resetState,
    });

    expect(commit()).toBe(true);
    expect(upsertCondition).toHaveBeenCalledTimes(1);
    expect(upsertCondition).toHaveBeenCalledWith(field, 'is_null', null, undefined, 0);
    expect(resetState).toHaveBeenCalledTimes(1);
  });

  it('hasIncompleteBuilding is false when no building is in progress', () => {
    const { hasIncompleteBuilding } = setupHook({ selectedField: null });
    expect(hasIncompleteBuilding()).toBe(false);
  });
});
