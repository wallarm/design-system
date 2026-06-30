import { useRef } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { BuildingBase } from '../hooks/useFilterInputAutocomplete/useAutocompleteState';
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
    buildingSide?: 0 | 1;
    buildingBase?: BuildingBase | null;
    upsertCondition?: ReturnType<typeof vi.fn>;
    handleCustomValueCommit?: ReturnType<typeof vi.fn>;
    resetState?: ReturnType<typeof vi.fn>;
    setBuildingSide?: ReturnType<typeof vi.fn>;
    setBuildingBase?: ReturnType<typeof vi.fn>;
  } = {},
) => {
  const upsertCondition = overrides.upsertCondition ?? vi.fn();
  const handleCustomValueCommit = overrides.handleCustomValueCommit ?? vi.fn();
  const resetState = overrides.resetState ?? vi.fn();
  const setBuildingSide = overrides.setBuildingSide ?? vi.fn();
  const setBuildingBase = overrides.setBuildingBase ?? vi.fn();

  // Use `in` so that explicit `null` overrides win over the default —
  // `?? default` would silently coerce the explicit `null` back to default.
  const selectedField = 'selectedField' in overrides ? overrides.selectedField! : field;
  const selectedOperator = 'selectedOperator' in overrides ? overrides.selectedOperator! : operator;
  const inputText = 'inputText' in overrides ? overrides.inputText! : '';
  const editingChipId = 'editingChipId' in overrides ? overrides.editingChipId! : null;
  const buildingSide = overrides.buildingSide ?? 0;
  const buildingBase = 'buildingBase' in overrides ? overrides.buildingBase! : null;

  const { result } = renderHook(() => {
    const effectiveInsertIndexRef = useRef(0);
    const commitBuildingOnBlurRef = useRef<() => boolean>(() => false);
    const commitBuildingForceRef = useRef<() => boolean>(() => false);
    return useBlurCommit({
      selectedField,
      selectedOperator,
      inputText,
      editingChipId,
      effectiveInsertIndexRef,
      handleCustomValueCommit,
      upsertCondition,
      resetState,
      buildingSide,
      setBuildingSide,
      buildingBase,
      setBuildingBase,
      commitBuildingOnBlurRef,
      commitBuildingForceRef,
    });
  });

  return {
    commit: result.current.commitBuildingOnBlur,
    hasIncompleteBuilding: result.current.hasIncompleteBuilding,
    upsertCondition,
    handleCustomValueCommit,
    resetState,
    setBuildingSide,
    setBuildingBase,
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

  // AS-1179: building the paired *second* triplet is special — the base
  // triplet is already a complete, valid condition. A plain blur must NOT
  // drop the whole draft (as AS-970 does for a non-paired incomplete chip);
  // instead it commits the base and flags the still-missing paired value as
  // an error, so the chip lands red and resumable with a "Value is required"
  // notification — matching an existing chip whose value was cleared.
  describe('paired second triplet on blur (AS-1179)', () => {
    const pairedField: FieldMetadata = {
      name: 'context_param_value',
      label: 'Value',
      type: 'string',
    };
    const base: BuildingBase = {
      field,
      operator: '=',
      value: 'USER-AGENT',
    };

    it('commits the base and flags the missing paired value as an error', () => {
      const upsertCondition = vi.fn();
      const resetState = vi.fn();
      const setBuildingSide = vi.fn();
      const setBuildingBase = vi.fn();
      const { commit } = setupHook({
        selectedField: pairedField,
        selectedOperator: '=',
        inputText: '',
        buildingSide: 1,
        buildingBase: base,
        upsertCondition,
        resetState,
        setBuildingSide,
        setBuildingBase,
      });

      expect(commit()).toBe(true);
      // Base triplet committed verbatim.
      expect(upsertCondition).toHaveBeenNthCalledWith(1, field, '=', 'USER-AGENT', null, 0);
      // Paired value slot flagged so the renderer reddens that segment.
      expect(upsertCondition).toHaveBeenNthCalledWith(
        2,
        pairedField,
        '=',
        null,
        undefined,
        undefined,
        'value',
        undefined,
        1,
      );
      expect(setBuildingBase).toHaveBeenCalledWith(null);
      expect(setBuildingSide).toHaveBeenCalledWith(0);
      expect(resetState).toHaveBeenCalledTimes(1);
    });

    it('still commits a typed paired value as a custom value (no error flag)', () => {
      const handleCustomValueCommit = vi.fn();
      const upsertCondition = vi.fn();
      const { commit } = setupHook({
        selectedField: pairedField,
        selectedOperator: '=',
        inputText: 'Mozilla',
        buildingSide: 1,
        buildingBase: base,
        handleCustomValueCommit,
        upsertCondition,
      });

      expect(commit()).toBe(true);
      expect(handleCustomValueCommit).toHaveBeenCalledWith('Mozilla');
      expect(upsertCondition).not.toHaveBeenCalled();
    });
  });
});
