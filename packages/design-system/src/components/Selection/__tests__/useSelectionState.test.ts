import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSelectionState } from '../useSelectionState';

interface Item {
  id: string;
}

const items: Item[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
const getItemId = (item: Item) => item.id;

const setup = (initial: string[] = []) => {
  const onChange = vi.fn();
  let currentValue: string[] = initial;
  const { result, rerender } = renderHook(
    ({ value }: { value: string[] }) =>
      useSelectionState({
        items,
        getItemId,
        value,
        onChange: ids => {
          currentValue = ids;
          onChange(ids);
        },
      }),
    { initialProps: { value: currentValue } },
  );
  return {
    result,
    onChange,
    rerender: () => rerender({ value: currentValue }),
    getValue: () => currentValue,
  };
};

describe('useSelectionState', () => {
  describe('toggleItem', () => {
    it('adds id when not selected', () => {
      const { result, onChange } = setup();
      act(() => result.current.toggleItem('b'));
      expect(onChange).toHaveBeenCalledWith(['b']);
    });

    it('removes id when selected', () => {
      const { result, onChange } = setup(['b']);
      act(() => result.current.toggleItem('b'));
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('preserves itemIds order when adding', () => {
      const { result, onChange } = setup(['c']);
      act(() => result.current.toggleItem('a'));
      expect(onChange).toHaveBeenCalledWith(['a', 'c']);
    });

    it('does not call onChange for unknown id', () => {
      const { result, onChange } = setup();
      act(() => result.current.toggleItem('zzz'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('selectAll', () => {
    it('returns all itemIds in order', () => {
      const { result, onChange } = setup();
      act(() => result.current.selectAll());
      expect(onChange).toHaveBeenCalledWith(['a', 'b', 'c', 'd']);
    });
  });

  describe('clear', () => {
    it('returns empty array', () => {
      const { result, onChange } = setup(['a', 'b']);
      act(() => result.current.clear());
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('queries', () => {
    it('isSelected reflects value', () => {
      const { result } = setup(['a', 'c']);
      expect(result.current.isSelected('a')).toBe(true);
      expect(result.current.isSelected('b')).toBe(false);
    });

    it('isAllSelected true when every itemId is selected', () => {
      const { result } = setup(['a', 'b', 'c', 'd']);
      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.isIndeterminate).toBe(false);
    });

    it('isAllSelected false / isIndeterminate true on partial selection', () => {
      const { result } = setup(['a']);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isIndeterminate).toBe(true);
    });

    it('isAllSelected false / isIndeterminate false when items is empty', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useSelectionState({ items: [] as Item[], getItemId, value: [], onChange }),
      );
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isIndeterminate).toBe(false);
    });

    it('stale ids in value are preserved but ignored by isAllSelected', () => {
      const { result } = setup(['ghost']);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isIndeterminate).toBe(false);
      expect(result.current.isSelected('ghost')).toBe(true);
    });
  });

  describe('disabled support', () => {
    const setupWithDisabled = (initial: string[], disabled: string[]) => {
      const onChange = vi.fn();
      let currentValue: string[] = initial;
      const disabledIds = new Set(disabled);
      const { result, rerender } = renderHook(
        ({ value, disabledIds }: { value: string[]; disabledIds: Set<string> }) =>
          useSelectionState({
            items,
            getItemId,
            value,
            disabledIds,
            onChange: ids => {
              currentValue = ids;
              onChange(ids);
            },
          }),
        { initialProps: { value: currentValue, disabledIds } },
      );
      return {
        result,
        onChange,
        rerender: () => rerender({ value: currentValue, disabledIds }),
      };
    };

    it('toggleItem on disabled id is a no-op', () => {
      const { result, onChange } = setupWithDisabled([], ['b']);
      act(() => result.current.toggleItem('b'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('selectAll excludes disabled ids', () => {
      const { result, onChange } = setupWithDisabled([], ['b', 'd']);
      act(() => result.current.selectAll());
      expect(onChange).toHaveBeenCalledWith(['a', 'c']);
    });

    it('isAllSelected true when all enabled selected (some disabled)', () => {
      const { result } = setupWithDisabled(['a', 'c'], ['b', 'd']);
      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.isIndeterminate).toBe(false);
    });

    it('isAllSelected false when all items disabled', () => {
      const { result } = setupWithDisabled([], ['a', 'b', 'c', 'd']);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isIndeterminate).toBe(false);
    });

    it('exposes enabledItemIds preserving order', () => {
      const { result } = setupWithDisabled([], ['b']);
      expect(result.current.enabledItemIds).toEqual(['a', 'c', 'd']);
    });
  });

  describe('shift+click range', () => {
    it('selects diapason when shift-clicking unselected item after prior toggle', () => {
      const { result, onChange, rerender } = setup();
      act(() => result.current.toggleItem('a'));
      rerender();
      onChange.mockClear();
      act(() => result.current.toggleItem('c', { shiftKey: true }));
      expect(onChange).toHaveBeenCalledWith(['a', 'b', 'c']);
    });

    it('deselects diapason when shift-clicking selected item', () => {
      const { result, onChange, rerender } = setup(['a', 'b', 'c', 'd']);
      act(() => result.current.toggleItem('a'));
      rerender();
      onChange.mockClear();
      act(() => result.current.toggleItem('c', { shiftKey: true }));
      expect(onChange).toHaveBeenCalledWith(['d']);
    });

    it('falls back to single toggle when no prior lastToggledId', () => {
      const { result, onChange } = setup();
      act(() => result.current.toggleItem('c', { shiftKey: true }));
      expect(onChange).toHaveBeenCalledWith(['c']);
    });

    it('falls back to single toggle when shift-clicking same id as last', () => {
      const { result, onChange, rerender } = setup();
      act(() => result.current.toggleItem('b'));
      rerender();
      onChange.mockClear();
      act(() => result.current.toggleItem('b', { shiftKey: true }));
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('range works in reverse direction', () => {
      const { result, onChange, rerender } = setup();
      act(() => result.current.toggleItem('d'));
      rerender();
      onChange.mockClear();
      act(() => result.current.toggleItem('b', { shiftKey: true }));
      expect(onChange).toHaveBeenCalledWith(['b', 'c', 'd']);
    });

    it('range skips disabled ids', () => {
      const onChange = vi.fn();
      const value: string[] = [];
      const { result, rerender } = renderHook(
        ({ value, disabledIds }) =>
          useSelectionState({
            items,
            getItemId,
            value,
            disabledIds,
            onChange: ids => {
              value = ids;
              onChange(ids);
            },
          }),
        { initialProps: { value, disabledIds: new Set(['b']) } },
      );
      act(() => result.current.toggleItem('a'));
      rerender({ value, disabledIds: new Set(['b']) });
      onChange.mockClear();
      act(() => result.current.toggleItem('c', { shiftKey: true }));
      expect(onChange).toHaveBeenCalledWith(['a', 'c']);
    });

    it('does not update lastToggledId on a no-op (disabled)', () => {
      const onChange = vi.fn();
      const value: string[] = [];
      const { result, rerender } = renderHook(
        ({ value, disabledIds }) =>
          useSelectionState({
            items,
            getItemId,
            value,
            disabledIds,
            onChange: ids => {
              value = ids;
              onChange(ids);
            },
          }),
        { initialProps: { value, disabledIds: new Set(['b']) } },
      );
      act(() => result.current.toggleItem('a'));
      rerender({ value, disabledIds: new Set(['b']) });
      act(() => result.current.toggleItem('b'));
      rerender({ value, disabledIds: new Set(['b']) });
      onChange.mockClear();
      act(() => result.current.toggleItem('d', { shiftKey: true }));
      // range should be from 'a' (last successful toggle), not 'b'
      expect(onChange).toHaveBeenCalledWith(['a', 'c', 'd']);
    });
  });
});
