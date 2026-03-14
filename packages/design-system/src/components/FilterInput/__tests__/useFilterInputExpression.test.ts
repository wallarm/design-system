import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFilterInputExpression } from '../hooks/useFilterInputExpression';
import type { Condition, ExprNode, FieldMetadata, Group } from '../types';

const fields: FieldMetadata[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    values: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'integer',
    values: [
      { value: 1, label: 'Low' },
      { value: 5, label: 'Medium' },
    ],
  },
];

const statusField = fields[0]!;
const priorityField = fields[1]!;

describe('useFilterInputExpression', () => {
  describe('initial state', () => {
    it('starts with empty conditions and connectors', () => {
      const { result } = renderHook(() => useFilterInputExpression({ fields, error: false }));
      expect(result.current.conditions).toEqual([]);
      expect(result.current.connectors).toEqual([]);
      expect(result.current.chips).toEqual([]);
    });
  });

  describe('controlled mode (value prop)', () => {
    it('syncs conditions from a single Condition value', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, value: condition, error: false }),
      );

      expect(result.current.conditions).toHaveLength(1);
      expect(result.current.conditions[0]!.field).toBe('status');
    });

    it('syncs conditions from a Group value', () => {
      const group: Group = {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'status', operator: '=', value: 'active' },
          { type: 'condition', field: 'priority', operator: '>', value: 5 },
        ],
      };

      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, value: group, error: false }),
      );

      expect(result.current.conditions).toHaveLength(2);
      expect(result.current.connectors).toEqual(['and']);
    });
  });

  describe('upsertCondition', () => {
    it('adds a new condition and calls onChange', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, onChange, error: false }),
      );

      act(() => {
        result.current.upsertCondition(statusField, '=', 'active');
      });

      expect(result.current.conditions).toHaveLength(1);
      expect(result.current.conditions[0]).toEqual({
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'condition', field: 'status' }),
      );
    });

    it('adds connector when inserting second condition', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, onChange, error: false }),
      );

      act(() => {
        result.current.upsertCondition(statusField, '=', 'active');
      });
      act(() => {
        result.current.upsertCondition(priorityField, '>', 5);
      });

      expect(result.current.conditions).toHaveLength(2);
      expect(result.current.connectors).toEqual(['and']);
      // Second call produces a group expression
      const lastCall = onChange.mock.calls.at(-1)![0] as Group;
      expect(lastCall.type).toBe('group');
      expect(lastCall.operator).toBe('and');
      expect(lastCall.children).toHaveLength(2);
    });

    it('edits an existing condition by chipId', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, onChange, error: false }),
      );

      act(() => {
        result.current.upsertCondition(statusField, '=', 'active');
      });

      act(() => {
        result.current.upsertCondition(statusField, '=', 'pending', 'chip-0');
      });

      expect(result.current.conditions).toHaveLength(1);
      expect(result.current.conditions[0]!.value).toBe('pending');
    });

    it('inserts at specific index', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, onChange, error: false }),
      );

      act(() => {
        result.current.upsertCondition(statusField, '=', 'active');
      });
      act(() => {
        result.current.upsertCondition(statusField, '=', 'pending');
      });

      // Insert at index 1 (between the two)
      act(() => {
        result.current.upsertCondition(priorityField, '>', 5, null, 1);
      });

      expect(result.current.conditions).toHaveLength(3);
      expect(result.current.conditions[1]!.field).toBe('priority');
    });

    it('onChange receives correct expression after rapid sequential upserts (no stale closure)', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, onChange, error: false }),
      );

      // Add first condition
      act(() => {
        result.current.upsertCondition(statusField, '=', 'active');
      });

      // Add second condition immediately
      act(() => {
        result.current.upsertCondition(priorityField, '>', 5);
      });

      // The second onChange call should contain both conditions
      const lastExpr = onChange.mock.calls.at(-1)![0] as Group;
      expect(lastExpr.type).toBe('group');
      expect(lastExpr.children).toHaveLength(2);
      expect((lastExpr.children[0] as Condition).field).toBe('status');
      expect((lastExpr.children[1] as Condition).field).toBe('priority');
    });
  });

  describe('removeCondition', () => {
    it('removes a condition by chipId and calls onChange', () => {
      const onChange = vi.fn();
      const group: Group = {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'status', operator: '=', value: 'active' },
          { type: 'condition', field: 'priority', operator: '>', value: 5 },
        ],
      };

      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, value: group, onChange, error: false }),
      );

      act(() => {
        result.current.removeCondition('chip-0');
      });

      expect(result.current.conditions).toHaveLength(1);
      expect(result.current.conditions[0]!.field).toBe('priority');
      expect(result.current.connectors).toEqual([]);
      expect(onChange).toHaveBeenCalled();
    });

    it('removes connector when removing middle condition', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, onChange, error: false }),
      );

      act(() => {
        result.current.upsertCondition(statusField, '=', 'active');
      });
      act(() => {
        result.current.upsertCondition(priorityField, '>', 5);
      });
      act(() => {
        result.current.upsertCondition(statusField, '!=', 'pending');
      });

      expect(result.current.conditions).toHaveLength(3);
      expect(result.current.connectors).toHaveLength(2);

      act(() => {
        result.current.removeCondition('chip-1');
      });

      expect(result.current.conditions).toHaveLength(2);
      expect(result.current.connectors).toHaveLength(1);
    });
  });

  describe('removeConditionAtIndex', () => {
    it('removes condition at given index', () => {
      const onChange = vi.fn();
      const group: Group = {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'status', operator: '=', value: 'active' },
          { type: 'condition', field: 'priority', operator: '>', value: 5 },
        ],
      };

      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, value: group, onChange, error: false }),
      );

      act(() => {
        result.current.removeConditionAtIndex(0);
      });

      expect(result.current.conditions).toHaveLength(1);
      expect(result.current.conditions[0]!.field).toBe('priority');
    });

    it('does nothing for out-of-bounds index', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, onChange, error: false }),
      );

      act(() => {
        result.current.upsertCondition(statusField, '=', 'active');
      });

      onChange.mockClear();

      act(() => {
        result.current.removeConditionAtIndex(5);
      });

      expect(result.current.conditions).toHaveLength(1);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('clearAll', () => {
    it('clears all conditions and calls onChange with null', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, onChange, error: false }),
      );

      act(() => {
        result.current.upsertCondition(statusField, '=', 'active');
      });
      act(() => {
        result.current.upsertCondition(priorityField, '>', 5);
      });

      onChange.mockClear();

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.conditions).toEqual([]);
      expect(result.current.connectors).toEqual([]);
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('setConnectorValue', () => {
    it('changes connector from AND to OR', () => {
      const onChange = vi.fn();
      const group: Group = {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'status', operator: '=', value: 'active' },
          { type: 'condition', field: 'priority', operator: '>', value: 5 },
        ],
      };

      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, value: group, onChange, error: false }),
      );

      expect(result.current.connectors).toEqual(['and']);

      act(() => {
        result.current.setConnectorValue('connector-1', 'or');
      });

      expect(result.current.connectors).toEqual(['or']);
      const lastExpr = onChange.mock.calls.at(-1)![0] as Group;
      expect(lastExpr.operator).toBe('or');
    });

    it('onChange receives fresh connectors (no stale closure)', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, onChange, error: false }),
      );

      // Build 3 conditions → 2 connectors
      act(() => result.current.upsertCondition(statusField, '=', 'active'));
      act(() => result.current.upsertCondition(priorityField, '>', 5));
      act(() => result.current.upsertCondition(statusField, '!=', 'pending'));

      onChange.mockClear();

      // Change first connector
      act(() => {
        result.current.setConnectorValue('connector-1', 'or');
      });

      // Change second connector right after
      act(() => {
        result.current.setConnectorValue('connector-2', 'or');
      });

      // Both should be 'or' now
      expect(result.current.connectors).toEqual(['or', 'or']);

      // The last onChange call should have both connectors as 'or'
      const lastExpr = onChange.mock.calls.at(-1)![0] as ExprNode;
      expect(lastExpr).toBeTruthy();
      // With both OR connectors, expression should be a flat OR group
      expect((lastExpr as Group).operator).toBe('or');
      expect((lastExpr as Group).children).toHaveLength(3);
    });
  });

  describe('chips', () => {
    it('builds chips from conditions and connectors', () => {
      const group: Group = {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'status', operator: '=', value: 'active' },
          { type: 'condition', field: 'priority', operator: '>', value: 5 },
        ],
      };

      const { result } = renderHook(() =>
        useFilterInputExpression({ fields, value: group, error: false }),
      );

      // 2 condition chips + 1 connector chip
      expect(result.current.chips).toHaveLength(3);
      expect(result.current.chips[0]!.variant).toBe('chip');
      expect(result.current.chips[0]!.attribute).toBe('Status');
      expect(result.current.chips[1]!.variant).toBe('and');
      expect(result.current.chips[2]!.variant).toBe('chip');
      expect(result.current.chips[2]!.attribute).toBe('Priority');
    });
  });

  describe('removeLastCondition is removed', () => {
    it('does not expose removeLastCondition', () => {
      const { result } = renderHook(() => useFilterInputExpression({ fields, error: false }));
      expect(result.current).not.toHaveProperty('removeLastCondition');
    });
  });
});
