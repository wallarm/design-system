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
  let value = initial;
  const { result, rerender } = renderHook(
    ({ value }) =>
      useSelectionState({
        items,
        getItemId,
        value,
        onChange: ids => {
          value = ids;
          onChange(ids);
        },
      }),
    { initialProps: { value } },
  );
  return {
    result,
    onChange,
    rerender: () => rerender({ value }),
    getValue: () => value,
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
});
