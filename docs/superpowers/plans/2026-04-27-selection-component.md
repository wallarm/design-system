# Selection Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `Selection` compound component family — a generic, reusable wrapper that provides per-item checkboxes, a select-all checkbox, and an animated bulk-action bar for arbitrary item lists (cards, custom layouts).

**Architecture:** Compound API rooted at `<Selection>`, which holds id-based selection state (`string[]`), wraps children in an ark-ui Popover anchor, and exposes a context consumed by `<SelectionItem>`, `<SelectionAll>` and `<SelectionBulkBar>`. State logic lives in `useSelectionState` (pure hook, fully unit-tested). Shift-key detection is centralized in `<Selection>` via `useIsKeyPressed` and passed to `toggleItem` per call.

**Tech Stack:** React 19, TypeScript (strict), `@ark-ui/react` (Popover, Portal), `class-variance-authority`, Tailwind, existing DS primitives (`Checkbox`, `CheckboxIndicator`, `HStack`, `VStack`, `Text`, `Link`), Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-04-27-selection-design.md`

---

## File Map

```
packages/design-system/src/components/Selection/
  index.ts                         — public exports
  Selection.tsx                    — root: state + Popover.Root + Anchor wrap
  SelectionContext.ts              — context type + createContext
  useSelectionContext.ts           — internal hook (throws outside <Selection>)
  useSelectionState.ts             — pure state hook (mutators + queries)
  SelectionItem.tsx                — item wrapper + inline checkbox + disabled register
  SelectionAll.tsx                 — standalone select-all checkbox
  classes.ts                       — CVA for SelectionItem layout
  SelectionBulkBar/
    index.ts
    SelectionBulkBar.tsx           — Portal + Popover.Content (bar UI)
    SelectionBulkBarSummary.tsx    — count + Select all + Clear
  __tests__/
    useSelectionState.test.ts      — Vitest unit tests for pure hook
  Selection.stories.tsx
  Selection.e2e.ts
```

Plus modify:
- `packages/design-system/src/index.ts` — re-export new public API alphabetically (after `Select`, before `Separator`).

Use established DS patterns: `cn()` for class merging, `data-slot` kebab-case attribute, `displayName`, ref forwarding via `ref` prop (React 19), named exports, types co-exported with components.

---

## Task 1: Scaffold folder + barrel + main index export

**Files:**
- Create: `packages/design-system/src/components/Selection/index.ts`
- Create: `packages/design-system/src/components/Selection/Selection.tsx` (placeholder)
- Modify: `packages/design-system/src/index.ts` (add Selection block)

This task establishes import paths early so subsequent tasks can wire imports without TS errors. Only the bare-minimum `<Selection>` placeholder is created — internals come in later tasks.

- [ ] **Step 1: Create placeholder `Selection.tsx`**

```tsx
// packages/design-system/src/components/Selection/Selection.tsx
import type { FC, ReactNode } from 'react';
import type { TestableProps } from '../../utils/testId';

export interface SelectionProps<T> extends TestableProps {
  items: T[];
  getItemId: (item: T) => string;
  value: string[];
  onChange: (ids: string[]) => void;
  className?: string;
  children?: ReactNode;
}

export const Selection = <T,>(_props: SelectionProps<T>) => {
  return null;
};

(Selection as FC).displayName = 'Selection';
```

- [ ] **Step 2: Create barrel `Selection/index.ts`**

```ts
// packages/design-system/src/components/Selection/index.ts
export { Selection, type SelectionProps } from './Selection';
```

- [ ] **Step 3: Add to main barrel**

In `packages/design-system/src/index.ts`, find the block:

```ts
} from './components/Select';
export { Separator, type SeparatorProps } from './components/Separator';
```

Insert between them:

```ts
} from './components/Select';
export { Selection, type SelectionProps } from './components/Selection';
export { Separator, type SeparatorProps } from './components/Separator';
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS (no new errors)

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection packages/design-system/src/index.ts
git add packages/design-system/src/components/Selection packages/design-system/src/index.ts
git commit -m "feat(selection): scaffold Selection component package [AS-884]"
```

---

## Task 2: `useSelectionState` — basic mutators (toggle / selectAll / clear / queries)

**Files:**
- Create: `packages/design-system/src/components/Selection/useSelectionState.ts`
- Create: `packages/design-system/src/components/Selection/__tests__/useSelectionState.test.ts`

The pure hook holds no React state of its own (selection is fully controlled). It computes derived values and returns mutator callbacks that emit new id arrays through `onChange`.

- [ ] **Step 1: Write failing test file**

```ts
// packages/design-system/src/components/Selection/__tests__/useSelectionState.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm/design-system test -- useSelectionState`
Expected: FAIL — `Cannot find module '../useSelectionState'`

- [ ] **Step 3: Implement `useSelectionState` (basic version, no shift/disabled yet)**

```ts
// packages/design-system/src/components/Selection/useSelectionState.ts
import { useCallback, useMemo } from 'react';

export interface UseSelectionStateParams<T> {
  items: T[];
  getItemId: (item: T) => string;
  value: string[];
  onChange: (ids: string[]) => void;
}

export interface UseSelectionStateResult {
  itemIds: string[];
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleItem: (id: string) => void;
  selectAll: () => void;
  clear: () => void;
}

export const useSelectionState = <T>({
  items,
  getItemId,
  value,
  onChange,
}: UseSelectionStateParams<T>): UseSelectionStateResult => {
  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId]);
  const itemIdSet = useMemo(() => new Set(itemIds), [itemIds]);
  const selectedIds = useMemo(() => new Set(value), [value]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const validSelectedCount = useMemo(() => {
    let n = 0;
    for (const id of selectedIds) if (itemIdSet.has(id)) n++;
    return n;
  }, [selectedIds, itemIdSet]);

  const isAllSelected = itemIds.length > 0 && validSelectedCount === itemIds.length;
  const isIndeterminate = validSelectedCount > 0 && validSelectedCount < itemIds.length;

  const emitOrdered = useCallback(
    (ids: Set<string>) => {
      const next: string[] = [];
      for (const id of itemIds) if (ids.has(id)) next.push(id);
      // preserve any "stale" ids that were already in `value` but not in items
      for (const id of value) if (!itemIdSet.has(id) && ids.has(id)) next.push(id);
      onChange(next);
    },
    [itemIds, itemIdSet, value, onChange],
  );

  const toggleItem = useCallback(
    (id: string) => {
      if (!itemIdSet.has(id)) return;
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      emitOrdered(next);
    },
    [itemIdSet, selectedIds, emitOrdered],
  );

  const selectAll = useCallback(() => {
    emitOrdered(new Set(itemIds));
  }, [itemIds, emitOrdered]);

  const clear = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return {
    itemIds,
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    selectAll,
    clear,
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @wallarm/design-system test -- useSelectionState`
Expected: PASS for all tests in this task.

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection
git add packages/design-system/src/components/Selection/useSelectionState.ts packages/design-system/src/components/Selection/__tests__/useSelectionState.test.ts
git commit -m "feat(selection): add useSelectionState basic mutators [AS-884]"
```

---

## Task 3: `useSelectionState` — disabled support

**Files:**
- Modify: `packages/design-system/src/components/Selection/useSelectionState.ts`
- Modify: `packages/design-system/src/components/Selection/__tests__/useSelectionState.test.ts`

Adds an optional `disabledIds: Set<string>` input. Disabled ids cannot be toggled and are excluded from `selectAll`. `isAllSelected` / `isIndeterminate` count only enabled ids.

- [ ] **Step 1: Add failing tests for disabled handling**

Append to `__tests__/useSelectionState.test.ts`:

```ts
describe('disabled support', () => {
  const setupWithDisabled = (initial: string[], disabled: string[]) => {
    const onChange = vi.fn();
    let value = initial;
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
      { initialProps: { value, disabledIds: new Set(disabled) } },
    );
    return { result, onChange, rerender };
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @wallarm/design-system test -- useSelectionState`
Expected: FAIL — `disabledIds` not recognized; `enabledItemIds` undefined.

- [ ] **Step 3: Update `useSelectionState` to accept `disabledIds` and expose `enabledItemIds`**

Replace the entire file content:

```ts
// packages/design-system/src/components/Selection/useSelectionState.ts
import { useCallback, useMemo } from 'react';

export interface UseSelectionStateParams<T> {
  items: T[];
  getItemId: (item: T) => string;
  value: string[];
  onChange: (ids: string[]) => void;
  /** Set of itemIds that cannot be toggled and are excluded from selectAll. */
  disabledIds?: Set<string>;
}

export interface UseSelectionStateResult {
  itemIds: string[];
  enabledItemIds: string[];
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleItem: (id: string) => void;
  selectAll: () => void;
  clear: () => void;
}

const EMPTY_DISABLED: ReadonlySet<string> = new Set();

export const useSelectionState = <T>({
  items,
  getItemId,
  value,
  onChange,
  disabledIds,
}: UseSelectionStateParams<T>): UseSelectionStateResult => {
  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId]);
  const itemIdSet = useMemo(() => new Set(itemIds), [itemIds]);
  const disabled = disabledIds ?? EMPTY_DISABLED;

  const enabledItemIds = useMemo(
    () => itemIds.filter(id => !disabled.has(id)),
    [itemIds, disabled],
  );

  const selectedIds = useMemo(() => new Set(value), [value]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const enabledSelectedCount = useMemo(() => {
    let n = 0;
    for (const id of enabledItemIds) if (selectedIds.has(id)) n++;
    return n;
  }, [enabledItemIds, selectedIds]);

  const isAllSelected =
    enabledItemIds.length > 0 && enabledSelectedCount === enabledItemIds.length;
  const isIndeterminate =
    enabledSelectedCount > 0 && enabledSelectedCount < enabledItemIds.length;

  const emitOrdered = useCallback(
    (ids: Set<string>) => {
      const next: string[] = [];
      for (const id of itemIds) if (ids.has(id)) next.push(id);
      for (const id of value) if (!itemIdSet.has(id) && ids.has(id)) next.push(id);
      onChange(next);
    },
    [itemIds, itemIdSet, value, onChange],
  );

  const toggleItem = useCallback(
    (id: string) => {
      if (!itemIdSet.has(id)) return;
      if (disabled.has(id)) return;
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      emitOrdered(next);
    },
    [itemIdSet, disabled, selectedIds, emitOrdered],
  );

  const selectAll = useCallback(() => {
    emitOrdered(new Set(enabledItemIds));
  }, [enabledItemIds, emitOrdered]);

  const clear = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return {
    itemIds,
    enabledItemIds,
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    selectAll,
    clear,
  };
};
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `pnpm --filter @wallarm/design-system test -- useSelectionState`
Expected: PASS (basic + disabled).

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection
git add packages/design-system/src/components/Selection/useSelectionState.ts packages/design-system/src/components/Selection/__tests__/useSelectionState.test.ts
git commit -m "feat(selection): add disabled-id support to useSelectionState [AS-884]"
```

---

## Task 4: `useSelectionState` — shift+click range

**Files:**
- Modify: `packages/design-system/src/components/Selection/useSelectionState.ts`
- Modify: `packages/design-system/src/components/Selection/__tests__/useSelectionState.test.ts`

`toggleItem` gains an optional `opts.shiftKey`. When `true` AND a previous `lastToggledId` exists AND it's different from the clicked id, the diapason between them (in `itemIds` order) is selected or deselected based on the clicked item's pre-toggle state. Disabled ids are skipped. The hook stores `lastToggledId` in a ref, updated only on successful toggle.

- [ ] **Step 1: Add failing tests for range selection**

Append to `__tests__/useSelectionState.test.ts`:

```ts
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
    let value: string[] = [];
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
    let value: string[] = [];
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @wallarm/design-system test -- useSelectionState`
Expected: FAIL — `toggleItem` does not accept second arg / range not implemented.

- [ ] **Step 3: Update `useSelectionState` for shift-range**

Replace the file content:

```ts
// packages/design-system/src/components/Selection/useSelectionState.ts
import { useCallback, useMemo, useRef } from 'react';

export interface UseSelectionStateParams<T> {
  items: T[];
  getItemId: (item: T) => string;
  value: string[];
  onChange: (ids: string[]) => void;
  /** Set of itemIds that cannot be toggled and are excluded from selectAll. */
  disabledIds?: Set<string>;
}

export interface ToggleItemOptions {
  shiftKey?: boolean;
}

export interface UseSelectionStateResult {
  itemIds: string[];
  enabledItemIds: string[];
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleItem: (id: string, opts?: ToggleItemOptions) => void;
  selectAll: () => void;
  clear: () => void;
}

const EMPTY_DISABLED: ReadonlySet<string> = new Set();

export const useSelectionState = <T>({
  items,
  getItemId,
  value,
  onChange,
  disabledIds,
}: UseSelectionStateParams<T>): UseSelectionStateResult => {
  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId]);
  const itemIdSet = useMemo(() => new Set(itemIds), [itemIds]);
  const disabled = disabledIds ?? EMPTY_DISABLED;

  const enabledItemIds = useMemo(
    () => itemIds.filter(id => !disabled.has(id)),
    [itemIds, disabled],
  );

  const selectedIds = useMemo(() => new Set(value), [value]);
  const lastToggledIdRef = useRef<string | null>(null);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const enabledSelectedCount = useMemo(() => {
    let n = 0;
    for (const id of enabledItemIds) if (selectedIds.has(id)) n++;
    return n;
  }, [enabledItemIds, selectedIds]);

  const isAllSelected =
    enabledItemIds.length > 0 && enabledSelectedCount === enabledItemIds.length;
  const isIndeterminate =
    enabledSelectedCount > 0 && enabledSelectedCount < enabledItemIds.length;

  const emitOrdered = useCallback(
    (ids: Set<string>) => {
      const next: string[] = [];
      for (const id of itemIds) if (ids.has(id)) next.push(id);
      for (const id of value) if (!itemIdSet.has(id) && ids.has(id)) next.push(id);
      onChange(next);
    },
    [itemIds, itemIdSet, value, onChange],
  );

  const toggleItem = useCallback(
    (id: string, opts?: ToggleItemOptions) => {
      if (!itemIdSet.has(id)) return;
      if (disabled.has(id)) return;

      const lastId = lastToggledIdRef.current;
      const wantsRange = !!opts?.shiftKey && lastId !== null && lastId !== id;

      if (wantsRange) {
        const fromIdx = itemIds.indexOf(lastId);
        const toIdx = itemIds.indexOf(id);
        if (fromIdx !== -1 && toIdx !== -1) {
          const start = Math.min(fromIdx, toIdx);
          const end = Math.max(fromIdx, toIdx);
          const selecting = !selectedIds.has(id);
          const next = new Set(selectedIds);
          for (let i = start; i <= end; i++) {
            const rangeId = itemIds[i];
            if (disabled.has(rangeId)) continue;
            if (selecting) next.add(rangeId);
            else next.delete(rangeId);
          }
          emitOrdered(next);
          lastToggledIdRef.current = id;
          return;
        }
      }

      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      emitOrdered(next);
      lastToggledIdRef.current = id;
    },
    [itemIdSet, disabled, itemIds, selectedIds, emitOrdered],
  );

  const selectAll = useCallback(() => {
    emitOrdered(new Set(enabledItemIds));
  }, [enabledItemIds, emitOrdered]);

  const clear = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return {
    itemIds,
    enabledItemIds,
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    selectAll,
    clear,
  };
};
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `pnpm --filter @wallarm/design-system test -- useSelectionState`
Expected: PASS (basic + disabled + range).

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection
git add packages/design-system/src/components/Selection/useSelectionState.ts packages/design-system/src/components/Selection/__tests__/useSelectionState.test.ts
git commit -m "feat(selection): add shift-click range selection [AS-884]"
```

---

## Task 5: SelectionContext + `useSelectionContext`

**Files:**
- Create: `packages/design-system/src/components/Selection/SelectionContext.ts`
- Create: `packages/design-system/src/components/Selection/useSelectionContext.ts`

The context exposes everything sub-components need: queries, mutators, and a registry callback for disabled items.

- [ ] **Step 1: Create context file**

```ts
// packages/design-system/src/components/Selection/SelectionContext.ts
import { createContext } from 'react';
import type { ToggleItemOptions } from './useSelectionState';

export interface SelectionContextValue {
  itemIds: string[];
  enabledItemIds: string[];
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleItem: (id: string, opts?: ToggleItemOptions) => void;
  selectAll: () => void;
  clear: () => void;
  /** Called by `<SelectionItem>` on mount/update to register its disabled state. */
  registerDisabled: (id: string, disabled: boolean) => () => void;
}

export const SelectionContext = createContext<SelectionContextValue | null>(null);
```

- [ ] **Step 2: Create internal hook**

```ts
// packages/design-system/src/components/Selection/useSelectionContext.ts
import { useContext } from 'react';
import { SelectionContext, type SelectionContextValue } from './SelectionContext';

export const useSelectionContext = (): SelectionContextValue => {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error(
      'Selection sub-components (SelectionItem, SelectionAll, SelectionBulkBar) must be used inside <Selection>.',
    );
  }
  return ctx;
};
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS.

- [ ] **Step 4: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection
git add packages/design-system/src/components/Selection
git commit -m "feat(selection): add SelectionContext and useSelectionContext [AS-884]"
```

---

## Task 6: `<Selection>` root — wire state, Popover.Root, Anchor

**Files:**
- Modify: `packages/design-system/src/components/Selection/Selection.tsx`

The root creates state via `useSelectionState`, manages a disabled-ids registry, owns one `useIsKeyPressed('Shift')` hook, wraps children in `Popover.Root` + `Popover.Anchor` (so `<SelectionBulkBar>` is positioned correctly), and exposes the context.

- [ ] **Step 1: Replace placeholder with full implementation**

```tsx
// packages/design-system/src/components/Selection/Selection.tsx
import { useCallback, useMemo, useRef, useState, type FC, type ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { useIsKeyPressed } from '../../hooks/useIsKeyPressed';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { SelectionContext, type SelectionContextValue } from './SelectionContext';
import { useSelectionState } from './useSelectionState';

const SELECTION_BULKBAR_HEIGHT = 52;
const SELECTION_BULKBAR_OFFSET = 32;

const SELECTION_BULKBAR_POSITIONING: ArkUiPopover.RootProps['positioning'] = Object.freeze({
  strategy: 'absolute',
  placement: 'bottom',
  gutter: 32,
  overlap: true,
  flip: false,
  offset: {
    mainAxis: -(SELECTION_BULKBAR_HEIGHT + SELECTION_BULKBAR_OFFSET),
  },
});

export interface SelectionProps<T> extends TestableProps {
  /** Source array — used for select-all and shift-click range ordering. */
  items: T[];
  /** Stable id extractor for items. */
  getItemId: (item: T) => string;
  /** Controlled selection state — array of selected item ids. */
  value: string[];
  /** Called with the next ordered array of selected ids. */
  onChange: (ids: string[]) => void;
  className?: string;
  children?: ReactNode;
}

export const Selection = <T,>({
  items,
  getItemId,
  value,
  onChange,
  className,
  'data-testid': testId,
  children,
}: SelectionProps<T>) => {
  // Disabled-id registry — populated by <SelectionItem> via context callback.
  const disabledMapRef = useRef<Map<string, boolean>>(new Map());
  const [disabledTick, setDisabledTick] = useState(0);

  const disabledIds = useMemo(() => {
    const set = new Set<string>();
    for (const [id, isDisabled] of disabledMapRef.current) {
      if (isDisabled) set.add(id);
    }
    return set;
    // re-evaluate when registry changes
  }, [disabledTick]);

  const registerDisabled = useCallback<SelectionContextValue['registerDisabled']>(
    (id, disabled) => {
      disabledMapRef.current.set(id, disabled);
      setDisabledTick(t => t + 1);
      return () => {
        disabledMapRef.current.delete(id);
        setDisabledTick(t => t + 1);
      };
    },
    [],
  );

  const shiftKeyRef = useIsKeyPressed('Shift');

  const state = useSelectionState({ items, getItemId, value, onChange, disabledIds });

  // Wrap toggleItem so callers in the tree don't need to read shift themselves.
  const toggleItem = useCallback<SelectionContextValue['toggleItem']>(
    (id, opts) => {
      const shiftKey = opts?.shiftKey ?? shiftKeyRef.current;
      state.toggleItem(id, { shiftKey });
    },
    [shiftKeyRef, state],
  );

  const ctxValue = useMemo<SelectionContextValue>(
    () => ({
      itemIds: state.itemIds,
      enabledItemIds: state.enabledItemIds,
      isSelected: state.isSelected,
      isAllSelected: state.isAllSelected,
      isIndeterminate: state.isIndeterminate,
      toggleItem,
      selectAll: state.selectAll,
      clear: state.clear,
      registerDisabled,
    }),
    [
      state.itemIds,
      state.enabledItemIds,
      state.isSelected,
      state.isAllSelected,
      state.isIndeterminate,
      state.selectAll,
      state.clear,
      toggleItem,
      registerDisabled,
    ],
  );

  return (
    <SelectionContext.Provider value={ctxValue}>
      <TestIdProvider value={testId}>
        <ArkUiPopover.Root
          open={value.length > 0}
          closeOnInteractOutside={false}
          portalled={false}
          positioning={SELECTION_BULKBAR_POSITIONING}
        >
          <ArkUiPopover.Anchor
            data-slot='selection'
            data-testid={testId}
            className={cn('relative outline-none', className)}
          >
            {children}
          </ArkUiPopover.Anchor>
        </ArkUiPopover.Root>
      </TestIdProvider>
    </SelectionContext.Provider>
  );
};

Selection.displayName = 'Selection';
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS.

- [ ] **Step 3: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection/Selection.tsx
git add packages/design-system/src/components/Selection/Selection.tsx
git commit -m "feat(selection): implement Selection root with Popover anchor and disabled registry [AS-884]"
```

---

## Task 7: `<SelectionItem>` + `classes.ts`

**Files:**
- Create: `packages/design-system/src/components/Selection/classes.ts`
- Create: `packages/design-system/src/components/Selection/SelectionItem.tsx`
- Modify: `packages/design-system/src/components/Selection/index.ts` (export)

`<SelectionItem>` registers its disabled state on mount/change, renders an inline `<Checkbox>` plus children, and dispatches `toggleItem` on checkbox change. The wrapper itself does not handle clicks — the user's content keeps its own click semantics.

- [ ] **Step 1: Create CVA classes file**

```ts
// packages/design-system/src/components/Selection/classes.ts
import { cva } from 'class-variance-authority';

export const selectionItemVariants = cva('flex items-start gap-12');
```

- [ ] **Step 2: Create `SelectionItem.tsx`**

```tsx
// packages/design-system/src/components/Selection/SelectionItem.tsx
import { useEffect, type FC, type ReactNode } from 'react';
import { Checkbox, CheckboxIndicator } from '../Checkbox';
import { cn } from '../../utils/cn';
import { selectionItemVariants } from './classes';
import { useSelectionContext } from './useSelectionContext';

export interface SelectionItemProps {
  /** Item id — must match an id present in the `<Selection>` `items` prop. */
  itemId: string;
  /** When true, the checkbox is disabled and the item is excluded from select-all and ranges. */
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export const SelectionItem: FC<SelectionItemProps> = ({
  itemId,
  disabled = false,
  className,
  children,
}) => {
  const { isSelected, toggleItem, registerDisabled } = useSelectionContext();
  const selected = isSelected(itemId);

  useEffect(() => {
    return registerDisabled(itemId, disabled);
  }, [itemId, disabled, registerDisabled]);

  return (
    <div
      data-slot='selection-item'
      data-selected={selected || undefined}
      className={cn(selectionItemVariants(), className)}
    >
      <Checkbox
        checked={selected}
        disabled={disabled}
        onCheckedChange={() => toggleItem(itemId)}
      >
        <CheckboxIndicator />
      </Checkbox>
      {children}
    </div>
  );
};

SelectionItem.displayName = 'SelectionItem';
```

- [ ] **Step 3: Update `Selection/index.ts`**

```ts
// packages/design-system/src/components/Selection/index.ts
export { Selection, type SelectionProps } from './Selection';
export { SelectionItem, type SelectionItemProps } from './SelectionItem';
```

- [ ] **Step 4: Add to main barrel**

In `packages/design-system/src/index.ts`, replace:

```ts
export { Selection, type SelectionProps } from './components/Selection';
```

with:

```ts
export {
  Selection,
  type SelectionItemProps,
  SelectionItem,
  type SelectionProps,
} from './components/Selection';
```

- [ ] **Step 5: Verify typecheck**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS.

- [ ] **Step 6: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection packages/design-system/src/index.ts
git add packages/design-system/src/components/Selection packages/design-system/src/index.ts
git commit -m "feat(selection): add SelectionItem with disabled registration [AS-884]"
```

---

## Task 8: `<SelectionAll>` standalone select-all checkbox

**Files:**
- Create: `packages/design-system/src/components/Selection/SelectionAll.tsx`
- Modify: `packages/design-system/src/components/Selection/index.ts`
- Modify: `packages/design-system/src/index.ts`

- [ ] **Step 1: Create `SelectionAll.tsx`**

```tsx
// packages/design-system/src/components/Selection/SelectionAll.tsx
import type { FC } from 'react';
import { Checkbox, CheckboxIndicator } from '../Checkbox';
import { useTestId } from '../../utils/testId';
import { useSelectionContext } from './useSelectionContext';

export interface SelectionAllProps {
  'data-testid'?: string;
}

export const SelectionAll: FC<SelectionAllProps> = ({
  'data-testid': testIdProp,
}) => {
  const { isAllSelected, isIndeterminate, enabledItemIds, selectAll, clear } =
    useSelectionContext();
  const testId = testIdProp ?? useTestId('all');

  return (
    <Checkbox
      data-testid={testId}
      data-slot='selection-all'
      checked={isIndeterminate ? 'indeterminate' : isAllSelected}
      disabled={enabledItemIds.length === 0}
      onCheckedChange={() => (isAllSelected ? clear() : selectAll())}
    >
      <CheckboxIndicator />
    </Checkbox>
  );
};

SelectionAll.displayName = 'SelectionAll';
```

- [ ] **Step 2: Update `Selection/index.ts`**

```ts
// packages/design-system/src/components/Selection/index.ts
export { Selection, type SelectionProps } from './Selection';
export { SelectionAll, type SelectionAllProps } from './SelectionAll';
export { SelectionItem, type SelectionItemProps } from './SelectionItem';
```

- [ ] **Step 3: Update main barrel** in `packages/design-system/src/index.ts`:

Replace the Selection block with:

```ts
export {
  Selection,
  SelectionAll,
  type SelectionAllProps,
  SelectionItem,
  type SelectionItemProps,
  type SelectionProps,
} from './components/Selection';
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS.

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection packages/design-system/src/index.ts
git add packages/design-system/src/components/Selection packages/design-system/src/index.ts
git commit -m "feat(selection): add SelectionAll standalone select-all checkbox [AS-884]"
```

---

## Task 9: `<SelectionBulkBarSummary>` (count + Select all + Clear)

**Files:**
- Modify: `packages/design-system/src/components/Selection/SelectionContext.ts` (add `selectedIds`)
- Modify: `packages/design-system/src/components/Selection/Selection.tsx` (expose `selectedIds`)
- Create: `packages/design-system/src/components/Selection/SelectionBulkBar/SelectionBulkBarSummary.tsx`

Mirrors `TableActionBarSelection`. Uses `Link` (DS) for "Select all" and "Clear" actions, `Text` for count and separator. The summary needs `selectedIds.size` for the count, so we first expose `selectedIds` on the context.

- [ ] **Step 1: Add `selectedIds` to context type**

Replace `packages/design-system/src/components/Selection/SelectionContext.ts`:

```ts
import { createContext } from 'react';
import type { ToggleItemOptions } from './useSelectionState';

export interface SelectionContextValue {
  itemIds: string[];
  enabledItemIds: string[];
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleItem: (id: string, opts?: ToggleItemOptions) => void;
  selectAll: () => void;
  clear: () => void;
  registerDisabled: (id: string, disabled: boolean) => () => void;
}

export const SelectionContext = createContext<SelectionContextValue | null>(null);
```

- [ ] **Step 2: Pass `selectedIds` through `<Selection>` ctxValue**

In `packages/design-system/src/components/Selection/Selection.tsx`, update the `ctxValue` `useMemo` to include `selectedIds: state.selectedIds,` in the returned object and `state.selectedIds` in the dependency array. The relevant block becomes:

```tsx
const ctxValue = useMemo<SelectionContextValue>(
  () => ({
    itemIds: state.itemIds,
    enabledItemIds: state.enabledItemIds,
    selectedIds: state.selectedIds,
    isSelected: state.isSelected,
    isAllSelected: state.isAllSelected,
    isIndeterminate: state.isIndeterminate,
    toggleItem,
    selectAll: state.selectAll,
    clear: state.clear,
    registerDisabled,
  }),
  [
    state.itemIds,
    state.enabledItemIds,
    state.selectedIds,
    state.isSelected,
    state.isAllSelected,
    state.isIndeterminate,
    state.selectAll,
    state.clear,
    toggleItem,
    registerDisabled,
  ],
);
```

- [ ] **Step 3: Create `SelectionBulkBarSummary.tsx`**

```tsx
// packages/design-system/src/components/Selection/SelectionBulkBar/SelectionBulkBarSummary.tsx
import type { FC } from 'react';
import { Link } from '../../Link';
import { HStack } from '../../Stack';
import { Text } from '../../Text';
import { useTestId } from '../../../utils/testId';
import { useSelectionContext } from '../useSelectionContext';

export const SelectionBulkBarSummary: FC = () => {
  const { isAllSelected, selectedIds, selectAll, clear } = useSelectionContext();
  const testId = useTestId('bulk-bar-summary');
  const count = selectedIds.size;

  return (
    <div data-testid={testId} className='flex items-center gap-16 p-8'>
      <Text size='sm' color='primary-alt' weight='medium'>
        {count} selected
      </Text>

      <HStack gap={6}>
        <Link
          type={isAllSelected ? 'muted' : 'alt'}
          size='md'
          onClick={selectAll}
          disabled={isAllSelected}
        >
          Select all
        </Link>

        <Text size='sm' color='tertiary-alt' weight='medium'>
          ·
        </Text>

        <Link type='alt' size='md' onClick={clear}>
          Clear
        </Link>
      </HStack>
    </div>
  );
};

SelectionBulkBarSummary.displayName = 'SelectionBulkBarSummary';
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS.

- [ ] **Step 5: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection
git add packages/design-system/src/components/Selection
git commit -m "feat(selection): add SelectionBulkBarSummary and expose selectedIds [AS-884]"
```

---

## Task 10: `<SelectionBulkBar>` (Portal + Popover.Content) and barrel updates

**Files:**
- Create: `packages/design-system/src/components/Selection/SelectionBulkBar/SelectionBulkBar.tsx`
- Create: `packages/design-system/src/components/Selection/SelectionBulkBar/index.ts`
- Modify: `packages/design-system/src/components/Selection/index.ts`
- Modify: `packages/design-system/src/index.ts`

- [ ] **Step 1: Create `SelectionBulkBar.tsx`**

```tsx
// packages/design-system/src/components/Selection/SelectionBulkBar/SelectionBulkBar.tsx
import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { HStack } from '../../Stack';
import { SelectionBulkBarSummary } from './SelectionBulkBarSummary';

export interface SelectionBulkBarProps {
  /** Override the toolbar accessible name. Defaults to "Bulk actions". */
  'aria-label'?: string;
  'data-testid'?: string;
  children?: ReactNode;
}

export const SelectionBulkBar: FC<SelectionBulkBarProps> = ({
  'aria-label': ariaLabel = 'Bulk actions',
  'data-testid': testIdProp,
  children,
}) => {
  const testId = testIdProp ?? useTestId('bulk-bar');

  return (
    <ArkUiPortal>
      <ArkUiPopover.Positioner style={{ zIndex: 50 }}>
        <ArkUiPopover.Content
          role='toolbar'
          aria-label={ariaLabel}
          data-slot='selection-bulk-bar'
          data-testid={testId}
          className={cn(
            'bg-component-toast-bg rounded-16 shadow-lg',
            'pl-12 pr-8 py-8',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom data-[state=open]:duration-300',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150',
          )}
        >
          <HStack gap={40} align='center'>
            <SelectionBulkBarSummary />
            <HStack gap={8} align='center'>
              {children}
            </HStack>
          </HStack>
        </ArkUiPopover.Content>
      </ArkUiPopover.Positioner>
    </ArkUiPortal>
  );
};

SelectionBulkBar.displayName = 'SelectionBulkBar';
```

- [ ] **Step 2: Create sub-folder index**

```ts
// packages/design-system/src/components/Selection/SelectionBulkBar/index.ts
export { SelectionBulkBar, type SelectionBulkBarProps } from './SelectionBulkBar';
```

- [ ] **Step 3: Update `Selection/index.ts`**

```ts
// packages/design-system/src/components/Selection/index.ts
export { Selection, type SelectionProps } from './Selection';
export { SelectionAll, type SelectionAllProps } from './SelectionAll';
export {
  SelectionBulkBar,
  type SelectionBulkBarProps,
} from './SelectionBulkBar';
export { SelectionItem, type SelectionItemProps } from './SelectionItem';
```

- [ ] **Step 4: Update main barrel** in `packages/design-system/src/index.ts`:

Replace the Selection block with:

```ts
export {
  Selection,
  SelectionAll,
  type SelectionAllProps,
  SelectionBulkBar,
  type SelectionBulkBarProps,
  SelectionItem,
  type SelectionItemProps,
  type SelectionProps,
} from './components/Selection';
```

- [ ] **Step 5: Verify typecheck**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS.

- [ ] **Step 6: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection packages/design-system/src/index.ts
git add packages/design-system/src/components/Selection packages/design-system/src/index.ts
git commit -m "feat(selection): add SelectionBulkBar with toolbar role and animations [AS-884]"
```

---

## Task 11: Storybook stories

**Files:**
- Create: `packages/design-system/src/components/Selection/Selection.stories.tsx`

Eight stories following the spec. They use `Card` family from the DS for realistic visuals.

- [ ] **Step 1: Create stories file**

```tsx
// packages/design-system/src/components/Selection/Selection.stories.tsx
import { useEffect, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Copy, Folder, Trash2 } from '../../icons';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Card } from '../Card';
import { CardContent } from '../Card/CardContent';
import { CardFooter } from '../Card/CardFooter';
import { CardHeader } from '../Card/CardHeader';
import { CardTitle } from '../Card/CardTitle';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { Selection } from './Selection';
import { SelectionAll } from './SelectionAll';
import { SelectionBulkBar } from './SelectionBulkBar';
import { SelectionItem } from './SelectionItem';

interface Cluster {
  id: string;
  title: string;
  region: string;
  status: 'Active' | 'Idle' | 'Error';
  locked?: boolean;
}

const clusters: Cluster[] = [
  { id: '1', title: 'Production cluster', region: 'us-east-1', status: 'Active' },
  { id: '2', title: 'Staging cluster', region: 'eu-west-1', status: 'Active' },
  { id: '3', title: 'Dev cluster', region: 'us-west-2', status: 'Idle' },
  { id: '4', title: 'Legacy cluster', region: 'ap-south-1', status: 'Error' },
  { id: '5', title: 'Read replica', region: 'us-east-1', status: 'Active', locked: true },
];

const meta = {
  title: 'Data Display/Selection',
  component: Selection,
  subcomponents: {
    SelectionItem,
    SelectionAll,
    SelectionBulkBar,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Selection is a compound component family that wraps arbitrary items, ' +
          'gives each one a checkbox, and reveals an animated bulk-action bar when items are selected. ' +
          'Use SelectionItem to wrap each item, SelectionAll for a select-all checkbox, ' +
          'and SelectionBulkBar for the action bar.',
      },
    },
  },
} satisfies Meta<typeof Selection>;

export default meta;

const ClusterCard = ({ cluster }: { cluster: Cluster }) => (
  <Card className='flex-1'>
    <CardHeader>
      <CardTitle>{cluster.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Text size='sm' color='secondary'>
        {cluster.region}
      </Text>
    </CardContent>
    <CardFooter>
      <Badge>{cluster.status}</Badge>
    </CardFooter>
  </Card>
);

export const Default: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection
      items={clusters}
      getItemId={c => c.id}
      value={selected}
      onChange={setSelected}
    >
      <VStack gap={12}>
        {clusters.map(c => (
          <SelectionItem key={c.id} itemId={c.id}>
            <ClusterCard cluster={c} />
          </SelectionItem>
        ))}
      </VStack>

      <SelectionBulkBar>
        <Button
          variant='ghost'
          color='neutral-alt'
          onClick={() => alert(`Duplicate ${selected.length}`)}
        >
          <Copy /> Duplicate
        </Button>
        <Button color='brand' onClick={() => alert(`Delete ${selected.length}`)}>
          <Trash2 /> Delete
        </Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const WithSelectAll: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection
      items={clusters}
      getItemId={c => c.id}
      value={selected}
      onChange={setSelected}
    >
      <VStack gap={16}>
        <HStack gap={8} align='center'>
          <SelectionAll />
          <Text size='sm' color='secondary'>
            Select all
          </Text>
        </HStack>

        <VStack gap={12}>
          {clusters.map(c => (
            <SelectionItem key={c.id} itemId={c.id}>
              <ClusterCard cluster={c} />
            </SelectionItem>
          ))}
        </VStack>
      </VStack>

      <SelectionBulkBar>
        <Button color='brand' onClick={() => alert(`Delete ${selected.length}`)}>
          <Trash2 /> Delete
        </Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const Grid: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection
      items={clusters}
      getItemId={c => c.id}
      value={selected}
      onChange={setSelected}
    >
      <div className='grid grid-cols-3 gap-12'>
        {clusters.map(c => (
          <SelectionItem key={c.id} itemId={c.id}>
            <ClusterCard cluster={c} />
          </SelectionItem>
        ))}
      </div>

      <SelectionBulkBar>
        <Button onClick={() => alert(selected.join(', '))}>Inspect</Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const WithDisabled: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection
      items={clusters}
      getItemId={c => c.id}
      value={selected}
      onChange={setSelected}
    >
      <VStack gap={8}>
        <HStack gap={8} align='center'>
          <SelectionAll />
          <Text size='sm' color='secondary'>
            Select all (locked items skipped)
          </Text>
        </HStack>

        <VStack gap={12}>
          {clusters.map(c => (
            <SelectionItem key={c.id} itemId={c.id} disabled={c.locked}>
              <ClusterCard cluster={c} />
            </SelectionItem>
          ))}
        </VStack>
      </VStack>

      <SelectionBulkBar>
        <Button color='brand' onClick={() => alert(`Delete ${selected.length}`)}>
          <Trash2 /> Delete
        </Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const RangeSelection: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection
      items={clusters}
      getItemId={c => c.id}
      value={selected}
      onChange={setSelected}
    >
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          Tip: hold <kbd>Shift</kbd> and click another checkbox to select a range.
        </Text>
        {clusters.map(c => (
          <SelectionItem key={c.id} itemId={c.id}>
            <ClusterCard cluster={c} />
          </SelectionItem>
        ))}
      </VStack>

      <SelectionBulkBar>
        <Button color='brand' onClick={() => alert(`Selected: ${selected.join(', ')}`)}>
          Confirm
        </Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const BulkActions: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection
      items={clusters}
      getItemId={c => c.id}
      value={selected}
      onChange={setSelected}
    >
      <VStack gap={12}>
        {clusters.map(c => (
          <SelectionItem key={c.id} itemId={c.id}>
            <ClusterCard cluster={c} />
          </SelectionItem>
        ))}
      </VStack>

      <SelectionBulkBar>
        <Button
          variant='ghost'
          color='neutral-alt'
          onClick={() => alert(`Move ${selected.length}`)}
        >
          <Folder /> Move
        </Button>
        <Button
          variant='ghost'
          color='neutral-alt'
          onClick={() => alert(`Duplicate ${selected.length}`)}
        >
          <Copy /> Duplicate
        </Button>
        <Button color='brand' onClick={() => alert(`Delete ${selected.length}`)}>
          <Trash2 /> Delete
        </Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const EmptyAndPartial: StoryFn<typeof meta> = () => {
  const [items, setItems] = useState<Cluster[]>(clusters);
  const [selected, setSelected] = useState<string[]>(['1', 'ghost']);

  // Demonstrate cleanup pattern: drop ids that no longer exist in items.
  useEffect(() => {
    setSelected(prev => prev.filter(id => items.some(c => c.id === id)));
  }, [items]);

  return (
    <VStack gap={16}>
      <HStack gap={8}>
        <Button onClick={() => setItems([])} variant='outline'>
          Clear items
        </Button>
        <Button onClick={() => setItems(clusters)} variant='outline'>
          Restore items
        </Button>
      </HStack>

      <Selection
        items={items}
        getItemId={c => c.id}
        value={selected}
        onChange={setSelected}
      >
        <VStack gap={12}>
          {items.length === 0 ? (
            <Text size='sm' color='secondary'>
              No items.
            </Text>
          ) : (
            items.map(c => (
              <SelectionItem key={c.id} itemId={c.id}>
                <ClusterCard cluster={c} />
              </SelectionItem>
            ))
          )}
        </VStack>

        <SelectionBulkBar>
          <Button color='brand' onClick={() => alert(`Delete ${selected.length}`)}>
            <Trash2 /> Delete
          </Button>
        </SelectionBulkBar>
      </Selection>
    </VStack>
  );
};

export const WithoutBulkBar: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection
      items={clusters}
      getItemId={c => c.id}
      value={selected}
      onChange={setSelected}
    >
      <VStack gap={16}>
        <Text size='sm' color='secondary'>
          Selected: {selected.length}
        </Text>

        <VStack gap={12}>
          {clusters.map(c => (
            <SelectionItem key={c.id} itemId={c.id}>
              <ClusterCard cluster={c} />
            </SelectionItem>
          ))}
        </VStack>
      </VStack>
    </Selection>
  );
};
```

- [ ] **Step 2: Verify Storybook builds and stories appear**

Run: `pnpm --filter @wallarm/design-system storybook` (manually) or `pnpm --filter @wallarm/design-system build-storybook` for a non-interactive check.
Expected: stories listed under `Data Display / Selection`.

- [ ] **Step 3: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection/Selection.stories.tsx
git add packages/design-system/src/components/Selection/Selection.stories.tsx
git commit -m "feat(selection): add Storybook stories with Card examples [AS-884]"
```

---

## Task 12: E2E tests (Playwright)

**Files:**
- Create: `packages/design-system/src/components/Selection/Selection.e2e.ts`

Per `docs/e2e-test-rules.md`: Visual + Interactions + Accessibility groups, Storybook IDs derived from the meta `title` `'Data Display/Selection'` → `data-display-selection`.

- [ ] **Step 1: Create `Selection.e2e.ts`**

```ts
// packages/design-system/src/components/Selection/Selection.e2e.ts
import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const selectionStory = createStoryHelper('data-display-selection', [
  'Default',
  'WithSelectAll',
  'Grid',
  'WithDisabled',
  'RangeSelection',
  'BulkActions',
  'EmptyAndPartial',
  'WithoutBulkBar',
] as const);

const getCheckboxes = (page: Page) =>
  page.locator('[data-slot="selection-item"] [role="checkbox"]');
const getSelectAll = (page: Page) => page.locator('[data-slot="selection-all"]');
const getBulkBar = (page: Page) => page.locator('[data-slot="selection-bulk-bar"]');

test.describe('Component: Selection', () => {
  test.describe('Visual', () => {
    test('Should render default unselected state correctly', async ({ page }) => {
      await selectionStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with one item selected correctly', async ({ page }) => {
      await selectionStory.goto(page, 'Default');
      await getCheckboxes(page).first().click();
      await expect(getBulkBar(page)).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render with all items selected correctly', async ({ page }) => {
      await selectionStory.goto(page, 'WithSelectAll');
      await getSelectAll(page).click();
      await expect(getBulkBar(page)).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled items correctly', async ({ page }) => {
      await selectionStory.goto(page, 'WithDisabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render grid layout correctly', async ({ page }) => {
      await selectionStory.goto(page, 'Grid');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should toggle selection when checkbox is clicked', async ({ page }) => {
      await selectionStory.goto(page, 'Default');
      const checkboxes = getCheckboxes(page);
      await checkboxes.first().click();
      await expect(checkboxes.first()).toHaveAttribute('data-state', 'checked');

      await checkboxes.first().click();
      await expect(checkboxes.first()).toHaveAttribute('data-state', 'unchecked');
    });

    test('Should select all when SelectionAll is clicked', async ({ page }) => {
      await selectionStory.goto(page, 'WithSelectAll');
      await getSelectAll(page).click();
      const checkboxes = getCheckboxes(page);
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toHaveAttribute('data-state', 'checked');
      }
    });

    test('Should clear selection via Clear link in bulk bar', async ({ page }) => {
      await selectionStory.goto(page, 'Default');
      await getCheckboxes(page).first().click();
      await getBulkBar(page).getByRole('link', { name: 'Clear' }).click();
      await expect(getCheckboxes(page).first()).toHaveAttribute('data-state', 'unchecked');
      await expect(getBulkBar(page)).toBeHidden();
    });

    test('Should select range when shift-clicking', async ({ page }) => {
      await selectionStory.goto(page, 'RangeSelection');
      const checkboxes = getCheckboxes(page);
      await checkboxes.nth(0).click();
      await page.keyboard.down('Shift');
      await checkboxes.nth(2).click();
      await page.keyboard.up('Shift');

      await expect(checkboxes.nth(0)).toHaveAttribute('data-state', 'checked');
      await expect(checkboxes.nth(1)).toHaveAttribute('data-state', 'checked');
      await expect(checkboxes.nth(2)).toHaveAttribute('data-state', 'checked');
    });

    test('Should not toggle disabled items', async ({ page }) => {
      await selectionStory.goto(page, 'WithDisabled');
      const lockedCheckbox = page
        .locator('[data-slot="selection-item"]')
        .last()
        .locator('[role="checkbox"]');
      await expect(lockedCheckbox).toHaveAttribute('data-disabled', '');
    });
  });

  test.describe('Accessibility', () => {
    test('Should expose toolbar role on bulk bar', async ({ page }) => {
      await selectionStory.goto(page, 'Default');
      await getCheckboxes(page).first().click();
      await expect(page.getByRole('toolbar', { name: 'Bulk actions' })).toBeVisible();
    });

    test('Should toggle via keyboard Space on a checkbox', async ({ page }) => {
      await selectionStory.goto(page, 'Default');
      const first = getCheckboxes(page).first();
      await first.focus();
      await page.keyboard.press('Space');
      await expect(first).toHaveAttribute('data-state', 'checked');
    });

    test('Should expose mixed aria state on indeterminate SelectionAll', async ({ page }) => {
      await selectionStory.goto(page, 'WithSelectAll');
      await getCheckboxes(page).first().click();
      await expect(getSelectAll(page)).toHaveAttribute('data-state', 'indeterminate');
    });
  });
});
```

- [ ] **Step 2: Run E2E to generate baselines**

Run: `pnpm --filter @wallarm/design-system test:e2e -- Selection`
Expected first run: visual tests fail (no snapshots yet) — generate with the project's screenshot-update flow (e.g., commit message `[update-screenshots]` on main per CLAUDE.md), or run with `--update-snapshots` locally.

- [ ] **Step 3: Update snapshots locally and verify**

Run: `pnpm --filter @wallarm/design-system test:e2e -- Selection --update-snapshots`
Then re-run without flag — Expected: PASS.

- [ ] **Step 4: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Selection/Selection.e2e.ts
git add packages/design-system/src/components/Selection
git commit -m "test(selection): add E2E coverage for Selection component [AS-884]"
```

---

## Final verification

- [ ] **Step 1: Full typecheck**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: PASS.

- [ ] **Step 3: Unit tests**

Run: `pnpm --filter @wallarm/design-system test`
Expected: All `useSelectionState` tests pass alongside the rest of the suite.

- [ ] **Step 4: Storybook smoke**

Run: `pnpm --filter @wallarm/design-system build-storybook`
Expected: build succeeds; `Data Display/Selection` stories present.

- [ ] **Step 5: E2E**

Run: `pnpm --filter @wallarm/design-system test:e2e -- Selection`
Expected: all tests pass with committed snapshots.
