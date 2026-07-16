# TableLayout — Foundation (Layer 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Layer-1 primitives of the new `TableLayout` component — a markup-driven, composable table that you hand-write as JSX — plus the `columnId` registry that binds cells to columns.

**Architecture:** Independent implementation (no shared code with the existing `Table`), living in `@wallarm-org/design-system`. Dumb primitives map 1:1 to DOM (`<table>/<thead>/<tbody>/<tr>/<th>/<td>/<colgroup>/<col>`) — same native-`<table>` foundation the existing `Table` uses (its virtualization is spacer-row based, not grid/transform). A React-context **column registry** (keyed by `columnId`) lets a `TableLayoutColumn` declaration feed presentation (align/width/pin) that a `TableLayoutCell columnId="…"` inherits — without leaking any attribute to the DOM. The root `<TableLayout>` exposes an imperative `TableLayoutHandle.scrollToRow(id)` via `ref` (DOM `data-row-id` lookup; virtualization delegate added in a later plan).

**Tech Stack:** React 19 · TypeScript · Tailwind v4 (DS theme tokens) · class-variance-authority · Vitest + @testing-library/react · Biome.

**Spec:** `../specs/2026-06-30-table-layout-design.md`. **Feature inventory:** `../specs/2026-06-30-table-layout-feature-inventory.md`.

**Naming note:** the new family is fully prefixed `TableLayout*` (root `TableLayout` → `<table>`) to avoid collisions — the existing `Table` already exports `Table`, `TableHandle`, `TableProps`, `TableScrollToRowOptions`, and the whole sugar layer.

## Global Constraints

- **Implementation repo/dir:** `/Users/half/Source/wallarm-cloud/ds/packages/design-system`. All paths below are relative to it; all commands run from it.
- **Independent from the existing `Table`:** do NOT import from `src/components/Table/*`. Reference it for ideas only (e.g. spacer-row virtualization in a later plan). Visual consistency comes from shared DS Tailwind tokens, not shared code.
- **Naming:** flat PascalCase, no abbreviations, no dot-notation. New family symbols are all `TableLayout*`.
- **Spacing:** 4px grid only (`px-16`, `py-8`, `py-4`); 1–2px allowed only for borders.
- **`columnId` never reaches the DOM as `id`/`name`** — it is consumed by the component; only `data-column-id` (for tests) may be emitted.
- **Tooling:** lint `pnpm lint`, types `pnpm typecheck`, tests `pnpm test:run`. Single quotes, semicolons, 2-space indent (Biome).
- **Commits:** do NOT run `git commit` unless the user explicitly asks (user global rule). Treat "Commit" steps as checkpoints — stage and pause for the user's go-ahead.

---

## Decomposition / Roadmap

This is the first of a sequence of independently-shippable plans. Each later plan builds on Layer 1:

1. **Foundation (this plan)** — primitives + `columnId` registry + sticky header + horizontal scroll container + `align` inheritance + `scrollToRow` handle.
2. **Column engine** — `useTableLayoutColumns` (imperative registry input), pinning sticky offsets, resize, visibility.
3. **Sorting** — `useTableLayoutSort` + `SortableTableLayoutHeaderCell`.
4. **Row selection + Action Bar** — `useTableLayoutRowSelection` + `TableLayoutSelectionCell`/`TableLayoutSelectAll` + `TableLayoutActionBar`.
5. **Row expanding** — `useTableLayoutExpanded` (single/multi) + `TableLayoutExpandTrigger`/`TableLayoutExpandedRow`.
6. **Virtualization + infinite scroll** — `useTableLayoutVirtualRows`/`useTableLayoutInfiniteScroll` + virtual `scrollToRow` delegate (spacer-row technique).
7. **Column reorder (DnD)**, 8. **Grouping**, 9. **Menus** (`TableLayoutColumnMenu`/`TableLayoutCellContextMenu`/`TableLayoutSettingsMenu`/`TableLayoutScrollHandler`), 10. **Compound facade** + empty/loading.

---

## File Structure (this plan)

All under `src/components/TableLayout/`:

- `types.ts` — public types: `TableLayoutColumnAlign`, `TableLayoutColumnPin`, `TableLayoutColumnPresentation`, `TableLayoutHandle`, `TableLayoutScrollToRowOptions`.
- `classes.ts` — Tailwind token strings for container/table/head/row/cells.
- `useColumnRegistry.ts` — registry hook (register/unregister/get + record).
- `TableLayoutContext.ts` — context + `useTableLayoutContext` guard hook.
- `primitives/TableLayout.tsx` — root `<table>` + scroll container + provider + `ref: TableLayoutHandle`.
- `primitives/TableLayoutHead.tsx` — sticky `<thead>`.
- `primitives/TableLayoutBody.tsx` — `<tbody>`.
- `primitives/TableLayoutRow.tsx` — `<tr>` + `rowId` → `data-row-id`.
- `primitives/TableLayoutHeaderCell.tsx` — `<th scope="col">`.
- `primitives/TableLayoutCell.tsx` — `<td>` + `columnId` align inheritance.
- `primitives/TableLayoutColumnGroup.tsx` — `<colgroup>`.
- `primitives/TableLayoutColumn.tsx` — `<col>` + registry registration.
- `index.ts` — public exports.
- Tests: `__tests__/useColumnRegistry.test.ts`, `__tests__/TableLayout.test.tsx`.

---

### Task 1: Types and class tokens

**Files:**
- Create: `src/components/TableLayout/types.ts`
- Create: `src/components/TableLayout/classes.ts`

**Interfaces:**
- Produces: `TableLayoutColumnAlign = 'left'|'center'|'right'`; `TableLayoutColumnPin = 'left'|'right'`; `TableLayoutColumnPresentation { align?: TableLayoutColumnAlign; pin?: TableLayoutColumnPin; width?: number }`; `TableLayoutScrollToRowOptions { align?: 'start'|'center'|'end'|'auto'; behavior?: 'auto'|'smooth' }`; `TableLayoutHandle { scrollToRow(id: string, opts?: TableLayoutScrollToRowOptions): boolean }`. Class tokens: `tableLayoutContainer`, `tableLayoutTable`, `tableLayoutHead`, `tableLayoutRow`, `tableLayoutHeaderCell`, `tableLayoutCell`, `cellAlignClass: Record<TableLayoutColumnAlign,string>`.

- [ ] **Step 1: Write the types file**

```ts
// src/components/TableLayout/types.ts

/** Cell text alignment, declared on a column and inherited by its cells. */
export type TableLayoutColumnAlign = 'left' | 'center' | 'right';

/** Column pin side (sticky offset wired up by the column-engine plan). */
export type TableLayoutColumnPin = 'left' | 'right';

/** Presentation a `TableLayoutColumn` registers and a `TableLayoutCell` inherits by `columnId`. */
export interface TableLayoutColumnPresentation {
  align?: TableLayoutColumnAlign;
  pin?: TableLayoutColumnPin;
  width?: number;
}

/** Options for the imperative `scrollToRow` method. */
export interface TableLayoutScrollToRowOptions {
  /** Alignment within the viewport. Default: 'auto'. */
  align?: 'start' | 'center' | 'end' | 'auto';
  /** Scroll behavior. Default: 'auto'. */
  behavior?: 'auto' | 'smooth';
}

/** Imperative handle exposed via `ref` on `<TableLayout>`. */
export interface TableLayoutHandle {
  /**
   * Scrolls to the row with the given id. Returns `true` if a matching
   * `[data-row-id]` row is currently mounted and a scroll was initiated,
   * `false` otherwise. Best-effort: the caller owns retry/pagination.
   */
  scrollToRow(id: string, opts?: TableLayoutScrollToRowOptions): boolean;
}
```

- [ ] **Step 2: Write the class tokens file**

```ts
// src/components/TableLayout/classes.ts
import { cn } from '../../utils/cn';
import type { TableLayoutColumnAlign } from './types';

/** Scroll container — owns horizontal overflow; `group/scroll` for pin shadows later. */
export const tableLayoutContainer = cn('group/scroll relative w-full overflow-x-auto');

export const tableLayoutTable = cn('w-full border-collapse text-sm text-text-primary');

/** Sticky header — stays put during vertical scroll. */
export const tableLayoutHead = cn('sticky top-0 z-30');

export const tableLayoutRow = cn('');

const cellBase = cn(
  'border-b border-r border-border-primary-light last:border-r-0 font-sans',
);

export const tableLayoutHeaderCell = cn(
  cellBase,
  'bg-bg-light-primary px-16 py-4 text-left text-xs font-medium text-text-secondary whitespace-nowrap',
);

export const tableLayoutCell = cn(cellBase, 'px-16 py-8 align-middle');

export const cellAlignClass: Record<TableLayoutColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};
```

- [ ] **Step 3: Verify it type-checks**

Run: `pnpm typecheck`
Expected: PASS (no errors referencing `TableLayout`). `cn` resolves from `../../utils/cn`.

- [ ] **Step 4: Commit (checkpoint — see Global Constraints)**

```bash
git add src/components/TableLayout/types.ts src/components/TableLayout/classes.ts
git commit -m "feat(table-layout): types and class tokens"
```

---

### Task 2: Column registry hook + context

**Files:**
- Create: `src/components/TableLayout/useColumnRegistry.ts`
- Create: `src/components/TableLayout/TableLayoutContext.ts`
- Test: `src/components/TableLayout/__tests__/useColumnRegistry.test.ts`

**Interfaces:**
- Consumes: `TableLayoutColumnPresentation` (Task 1).
- Produces:
  - `useColumnRegistry(): { columns: Record<string, TableLayoutColumnPresentation>; registerColumn(id, meta): void; unregisterColumn(id): void; getColumn(id): TableLayoutColumnPresentation | undefined }`.
  - `TableLayoutContextValue { registerColumn; unregisterColumn; getColumn; containerRef: RefObject<HTMLDivElement | null> }`.
  - `TableLayoutContext` (React context, default `null`).
  - `useTableLayoutContext(): TableLayoutContextValue` — throws outside `<TableLayout>`.

- [ ] **Step 1: Write the failing registry test**

```ts
// src/components/TableLayout/__tests__/useColumnRegistry.test.ts
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useColumnRegistry } from '../useColumnRegistry';

describe('useColumnRegistry', () => {
  it('registers a column and returns its presentation by id', () => {
    const { result } = renderHook(() => useColumnRegistry());
    act(() => result.current.registerColumn('status', { align: 'right', width: 120 }));
    expect(result.current.getColumn('status')).toEqual({ align: 'right', width: 120 });
  });

  it('removes a column on unregister', () => {
    const { result } = renderHook(() => useColumnRegistry());
    act(() => result.current.registerColumn('status', { align: 'right' }));
    act(() => result.current.unregisterColumn('status'));
    expect(result.current.getColumn('status')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run src/components/TableLayout/__tests__/useColumnRegistry.test.ts`
Expected: FAIL — cannot resolve `../useColumnRegistry`.

- [ ] **Step 3: Implement the registry hook**

```ts
// src/components/TableLayout/useColumnRegistry.ts
import { useCallback, useState } from 'react';
import type { TableLayoutColumnPresentation } from './types';

export const useColumnRegistry = () => {
  const [columns, setColumns] = useState<Record<string, TableLayoutColumnPresentation>>({});

  const registerColumn = useCallback((id: string, meta: TableLayoutColumnPresentation) => {
    setColumns(prev => ({ ...prev, [id]: meta }));
  }, []);

  const unregisterColumn = useCallback((id: string) => {
    setColumns(prev => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const getColumn = useCallback((id: string) => columns[id], [columns]);

  return { columns, registerColumn, unregisterColumn, getColumn };
};
```

- [ ] **Step 4: Implement the context + guard hook**

```ts
// src/components/TableLayout/TableLayoutContext.ts
import { createContext, type RefObject, useContext } from 'react';
import type { TableLayoutColumnPresentation } from './types';

export interface TableLayoutContextValue {
  registerColumn: (id: string, meta: TableLayoutColumnPresentation) => void;
  unregisterColumn: (id: string) => void;
  getColumn: (id: string) => TableLayoutColumnPresentation | undefined;
  containerRef: RefObject<HTMLDivElement | null>;
}

export const TableLayoutContext = createContext<TableLayoutContextValue | null>(null);

export const useTableLayoutContext = (): TableLayoutContextValue => {
  const ctx = useContext(TableLayoutContext);
  if (!ctx) {
    throw new Error('TableLayout primitives must be rendered inside <TableLayout>');
  }
  return ctx;
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test:run src/components/TableLayout/__tests__/useColumnRegistry.test.ts`
Expected: PASS (2 passed).

- [ ] **Step 6: Commit (checkpoint)**

```bash
git add src/components/TableLayout/useColumnRegistry.ts src/components/TableLayout/TableLayoutContext.ts src/components/TableLayout/__tests__/useColumnRegistry.test.ts
git commit -m "feat(table-layout): column registry hook and context"
```

---

### Task 3: `TableLayout` root primitive (provider + scroll container + `scrollToRow`)

**Files:**
- Create: `src/components/TableLayout/primitives/TableLayout.tsx`

**Interfaces:**
- Consumes: `useColumnRegistry` (Task 2), `TableLayoutContext`/`TableLayoutContextValue` (Task 2), `TableLayoutHandle`/`TableLayoutScrollToRowOptions` (Task 1), tokens (Task 1).
- Produces: `TableLayout` — `forwardRef<TableLayoutHandle, TableLayoutProps>`; `TableLayoutProps = Omit<ComponentPropsWithRef<'table'>, 'ref'>`. Renders `<div container><table/></div>`, provides context, exposes `scrollToRow`.

- [ ] **Step 1: Implement the component** (covered by the integration test in Task 9; no standalone unit test — this primitive's behavior is only observable through children)

```tsx
// src/components/TableLayout/primitives/TableLayout.tsx
import {
  type ComponentPropsWithRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { cn } from '../../../utils/cn';
import { tableLayoutContainer, tableLayoutTable } from '../classes';
import { TableLayoutContext, type TableLayoutContextValue } from '../TableLayoutContext';
import type { TableLayoutHandle } from '../types';
import { useColumnRegistry } from '../useColumnRegistry';

export type TableLayoutProps = Omit<ComponentPropsWithRef<'table'>, 'ref'>;

export const TableLayout = forwardRef<TableLayoutHandle, TableLayoutProps>(
  ({ className, children, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { registerColumn, unregisterColumn, getColumn } = useColumnRegistry();

    useImperativeHandle(
      ref,
      (): TableLayoutHandle => ({
        scrollToRow(id, opts) {
          const row = containerRef.current?.querySelector<HTMLTableRowElement>(
            `[data-row-id="${CSS.escape(id)}"]`,
          );
          if (!row) return false;
          row.scrollIntoView({
            block: !opts?.align || opts.align === 'auto' ? 'nearest' : opts.align,
            behavior: opts?.behavior ?? 'auto',
          });
          return true;
        },
      }),
      [],
    );

    const value = useMemo<TableLayoutContextValue>(
      () => ({ registerColumn, unregisterColumn, getColumn, containerRef }),
      [registerColumn, unregisterColumn, getColumn],
    );

    return (
      <TableLayoutContext.Provider value={value}>
        <div ref={containerRef} className={cn(tableLayoutContainer, className)}>
          <table className={tableLayoutTable} {...props}>
            {children}
          </table>
        </div>
      </TableLayoutContext.Provider>
    );
  },
);
TableLayout.displayName = 'TableLayout';
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit (checkpoint)**

```bash
git add src/components/TableLayout/primitives/TableLayout.tsx
git commit -m "feat(table-layout): root TableLayout primitive with scrollToRow handle"
```

---

### Task 4: `TableLayoutHead` and `TableLayoutBody` primitives

**Files:**
- Create: `src/components/TableLayout/primitives/TableLayoutHead.tsx`
- Create: `src/components/TableLayout/primitives/TableLayoutBody.tsx`

**Interfaces:**
- Consumes: `tableLayoutHead` (Task 1).
- Produces: `TableLayoutHead` — `forwardRef<HTMLTableSectionElement, ComponentPropsWithRef<'thead'>>`, sticky. `TableLayoutBody` — `forwardRef<HTMLTableSectionElement, ComponentPropsWithRef<'tbody'>>`.

- [ ] **Step 1: Implement `TableLayoutHead`**

```tsx
// src/components/TableLayout/primitives/TableLayoutHead.tsx
import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import { tableLayoutHead } from '../classes';

export const TableLayoutHead = forwardRef<HTMLTableSectionElement, ComponentPropsWithRef<'thead'>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn(tableLayoutHead, className)} {...props} />
  ),
);
TableLayoutHead.displayName = 'TableLayoutHead';
```

- [ ] **Step 2: Implement `TableLayoutBody`**

```tsx
// src/components/TableLayout/primitives/TableLayoutBody.tsx
import { type ComponentPropsWithRef, forwardRef } from 'react';

export const TableLayoutBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithRef<'tbody'>>(
  (props, ref) => <tbody ref={ref} {...props} />,
);
TableLayoutBody.displayName = 'TableLayoutBody';
```

- [ ] **Step 3: Verify it type-checks**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit (checkpoint)**

```bash
git add src/components/TableLayout/primitives/TableLayoutHead.tsx src/components/TableLayout/primitives/TableLayoutBody.tsx
git commit -m "feat(table-layout): TableLayoutHead (sticky) and TableLayoutBody primitives"
```

---

### Task 5: `TableLayoutRow` primitive (`rowId` → `data-row-id`)

**Files:**
- Create: `src/components/TableLayout/primitives/TableLayoutRow.tsx`

**Interfaces:**
- Consumes: `tableLayoutRow` (Task 1).
- Produces: `TableLayoutRow` — `forwardRef<HTMLTableRowElement, TableLayoutRowProps>`; `TableLayoutRowProps = ComponentPropsWithRef<'tr'> & { rowId?: string }`. Stamps `data-row-id={rowId}` (omitted when undefined).

- [ ] **Step 1: Implement the component**

```tsx
// src/components/TableLayout/primitives/TableLayoutRow.tsx
import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import { tableLayoutRow } from '../classes';

export interface TableLayoutRowProps extends ComponentPropsWithRef<'tr'> {
  /** Stable row id; stamps `data-row-id` so `TableLayoutHandle.scrollToRow` can find it. */
  rowId?: string;
}

export const TableLayoutRow = forwardRef<HTMLTableRowElement, TableLayoutRowProps>(
  ({ className, rowId, ...props }, ref) => (
    <tr ref={ref} data-row-id={rowId} className={cn(tableLayoutRow, className)} {...props} />
  ),
);
TableLayoutRow.displayName = 'TableLayoutRow';
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm typecheck`
Expected: PASS. (`data-row-id={undefined}` renders no attribute — asserted in Task 9.)

- [ ] **Step 3: Commit (checkpoint)**

```bash
git add src/components/TableLayout/primitives/TableLayoutRow.tsx
git commit -m "feat(table-layout): TableLayoutRow primitive with rowId"
```

---

### Task 6: `TableLayoutHeaderCell` primitive

**Files:**
- Create: `src/components/TableLayout/primitives/TableLayoutHeaderCell.tsx`

**Interfaces:**
- Consumes: `tableLayoutHeaderCell` (Task 1).
- Produces: `TableLayoutHeaderCell` — `forwardRef<HTMLTableCellElement, ComponentPropsWithRef<'th'>>`; renders `<th scope="col">`.

- [ ] **Step 1: Implement the component**

```tsx
// src/components/TableLayout/primitives/TableLayoutHeaderCell.tsx
import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import { tableLayoutHeaderCell } from '../classes';

export const TableLayoutHeaderCell = forwardRef<
  HTMLTableCellElement,
  ComponentPropsWithRef<'th'>
>(({ className, ...props }, ref) => (
  <th ref={ref} scope='col' className={cn(tableLayoutHeaderCell, className)} {...props} />
));
TableLayoutHeaderCell.displayName = 'TableLayoutHeaderCell';
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit (checkpoint)**

```bash
git add src/components/TableLayout/primitives/TableLayoutHeaderCell.tsx
git commit -m "feat(table-layout): TableLayoutHeaderCell primitive"
```

---

### Task 7: `TableLayoutCell` primitive (`columnId` align inheritance, no DOM leak)

**Files:**
- Create: `src/components/TableLayout/primitives/TableLayoutCell.tsx`
- Test: assertions added to `__tests__/TableLayout.test.tsx` in Task 9 (needs `TableLayoutColumn` from Task 8 to exercise inheritance end-to-end).

**Interfaces:**
- Consumes: `useTableLayoutContext` (Task 2), `tableLayoutCell`/`cellAlignClass` (Task 1).
- Produces: `TableLayoutCell` — `forwardRef<HTMLTableCellElement, TableLayoutCellProps>`; `TableLayoutCellProps = ComponentPropsWithRef<'td'> & { columnId?: string }`. Reads align from the registry by `columnId`; emits `data-column-id`; **does not** forward `columnId` as a DOM attribute.

- [ ] **Step 1: Implement the component**

```tsx
// src/components/TableLayout/primitives/TableLayoutCell.tsx
import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import { cellAlignClass, tableLayoutCell } from '../classes';
import { useTableLayoutContext } from '../TableLayoutContext';

export interface TableLayoutCellProps extends ComponentPropsWithRef<'td'> {
  /** Binds this cell to a `TableLayoutColumn` of the same `columnId` to inherit presentation. */
  columnId?: string;
}

export const TableLayoutCell = forwardRef<HTMLTableCellElement, TableLayoutCellProps>(
  ({ className, columnId, ...props }, ref) => {
    const { getColumn } = useTableLayoutContext();
    const align = columnId ? getColumn(columnId)?.align : undefined;
    return (
      <td
        ref={ref}
        data-column-id={columnId}
        className={cn(tableLayoutCell, align && cellAlignClass[align], className)}
        {...props}
      />
    );
  },
);
TableLayoutCell.displayName = 'TableLayoutCell';
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm typecheck`
Expected: PASS. (`columnId` is destructured out, so it is never in `...props` → never forwarded to `<td>`.)

- [ ] **Step 3: Commit (checkpoint)**

```bash
git add src/components/TableLayout/primitives/TableLayoutCell.tsx
git commit -m "feat(table-layout): TableLayoutCell primitive with columnId align inheritance"
```

---

### Task 8: `TableLayoutColumnGroup` + `TableLayoutColumn` primitives (registry input)

**Files:**
- Create: `src/components/TableLayout/primitives/TableLayoutColumnGroup.tsx`
- Create: `src/components/TableLayout/primitives/TableLayoutColumn.tsx`

**Interfaces:**
- Consumes: `useTableLayoutContext` (Task 2), `TableLayoutColumnAlign`/`TableLayoutColumnPin` (Task 1).
- Produces:
  - `TableLayoutColumnGroup` — `forwardRef<HTMLTableColElement, ComponentPropsWithRef<'colgroup'>>`; renders `<colgroup>`.
  - `TableLayoutColumn` — `({ columnId, align?, pin?, width? }: TableLayoutColumnProps) => JSX`; renders `<col>` (width as inline style) and registers `{ align, pin, width }` under `columnId` for the cell lifetime.

- [ ] **Step 1: Implement `TableLayoutColumnGroup`**

```tsx
// src/components/TableLayout/primitives/TableLayoutColumnGroup.tsx
import { type ComponentPropsWithRef, forwardRef } from 'react';

export const TableLayoutColumnGroup = forwardRef<
  HTMLTableColElement,
  ComponentPropsWithRef<'colgroup'>
>((props, ref) => <colgroup ref={ref} {...props} />);
TableLayoutColumnGroup.displayName = 'TableLayoutColumnGroup';
```

- [ ] **Step 2: Implement `TableLayoutColumn`**

```tsx
// src/components/TableLayout/primitives/TableLayoutColumn.tsx
import { useEffect } from 'react';
import { useTableLayoutContext } from '../TableLayoutContext';
import type { TableLayoutColumnAlign, TableLayoutColumnPin } from '../types';

export interface TableLayoutColumnProps {
  /** Column identity; cells bind to it via the same `columnId`. */
  columnId: string;
  /** Text alignment inherited by this column's cells. */
  align?: TableLayoutColumnAlign;
  /** Pin side (sticky offsets wired up by the column-engine plan). */
  pin?: TableLayoutColumnPin;
  /** Column width in px (applied to the underlying `<col>`). */
  width?: number;
}

export const TableLayoutColumn = ({ columnId, align, pin, width }: TableLayoutColumnProps) => {
  const { registerColumn, unregisterColumn } = useTableLayoutContext();

  useEffect(() => {
    registerColumn(columnId, { align, pin, width });
    return () => unregisterColumn(columnId);
  }, [columnId, align, pin, width, registerColumn, unregisterColumn]);

  return <col data-column-id={columnId} style={width ? { width } : undefined} />;
};
TableLayoutColumn.displayName = 'TableLayoutColumn';
```

- [ ] **Step 3: Verify it type-checks**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit (checkpoint)**

```bash
git add src/components/TableLayout/primitives/TableLayoutColumnGroup.tsx src/components/TableLayout/primitives/TableLayoutColumn.tsx
git commit -m "feat(table-layout): TableLayoutColumnGroup and TableLayoutColumn primitives"
```

---

### Task 9: Public exports + Tier-0 integration test

**Files:**
- Create: `src/components/TableLayout/index.ts`
- Create: `src/components/TableLayout/__tests__/TableLayout.test.tsx`

**Interfaces:**
- Consumes: all primitives (Tasks 3–8) and types (Task 1).
- Produces: barrel exporting `TableLayout`, `TableLayoutHead`, `TableLayoutBody`, `TableLayoutRow`, `TableLayoutHeaderCell`, `TableLayoutCell`, `TableLayoutColumnGroup`, `TableLayoutColumn`, and types `TableLayoutHandle`, `TableLayoutScrollToRowOptions`, `TableLayoutColumnAlign`, `TableLayoutColumnPin`, `TableLayoutColumnPresentation`, `TableLayoutRowProps`, `TableLayoutCellProps`, `TableLayoutColumnProps`, `TableLayoutProps`.

- [ ] **Step 1: Write the barrel export**

```ts
// src/components/TableLayout/index.ts
export { TableLayout, type TableLayoutProps } from './primitives/TableLayout';
export { TableLayoutBody } from './primitives/TableLayoutBody';
export { TableLayoutCell, type TableLayoutCellProps } from './primitives/TableLayoutCell';
export { TableLayoutColumn, type TableLayoutColumnProps } from './primitives/TableLayoutColumn';
export { TableLayoutColumnGroup } from './primitives/TableLayoutColumnGroup';
export { TableLayoutHead } from './primitives/TableLayoutHead';
export { TableLayoutHeaderCell } from './primitives/TableLayoutHeaderCell';
export { TableLayoutRow, type TableLayoutRowProps } from './primitives/TableLayoutRow';
export type {
  TableLayoutColumnAlign,
  TableLayoutColumnPin,
  TableLayoutColumnPresentation,
  TableLayoutHandle,
  TableLayoutScrollToRowOptions,
} from './types';
```

- [ ] **Step 2: Write the failing integration test**

```tsx
// src/components/TableLayout/__tests__/TableLayout.test.tsx
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  TableLayout,
  TableLayoutBody,
  TableLayoutCell,
  TableLayoutColumn,
  TableLayoutColumnGroup,
  type TableLayoutHandle,
  TableLayoutHead,
  TableLayoutHeaderCell,
  TableLayoutRow,
} from '..';

const renderTable = (ref?: React.Ref<TableLayoutHandle>) =>
  render(
    <TableLayout ref={ref} aria-label='Policies'>
      <TableLayoutColumnGroup>
        <TableLayoutColumn columnId='title' width={240} />
        <TableLayoutColumn columnId='count' width={120} align='right' />
      </TableLayoutColumnGroup>
      <TableLayoutHead>
        <TableLayoutRow>
          <TableLayoutHeaderCell>Title</TableLayoutHeaderCell>
          <TableLayoutHeaderCell>Count</TableLayoutHeaderCell>
        </TableLayoutRow>
      </TableLayoutHead>
      <TableLayoutBody>
        {[
          { id: 'a', title: 'Alpha', count: 3 },
          { id: 'b', title: 'Beta', count: 7 },
        ].map(row => (
          <TableLayoutRow key={row.id} rowId={row.id}>
            <TableLayoutCell columnId='title'>{row.title}</TableLayoutCell>
            <TableLayoutCell columnId='count'>{row.count}</TableLayoutCell>
          </TableLayoutRow>
        ))}
      </TableLayoutBody>
    </TableLayout>,
  );

describe('TableLayout primitives', () => {
  it('renders an accessible table with header and body cells', () => {
    renderTable();
    const table = screen.getByRole('table', { name: 'Policies' });
    expect(table).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('inherits column align onto cells by columnId', () => {
    renderTable();
    expect(screen.getByRole('cell', { name: '7' })).toHaveClass('text-right');
    expect(screen.getByRole('cell', { name: 'Beta' })).not.toHaveClass('text-right');
  });

  it('does not leak columnId to the DOM as id/name', () => {
    renderTable();
    const cell = screen.getByRole('cell', { name: 'Alpha' });
    expect(cell).not.toHaveAttribute('id');
    expect(cell).not.toHaveAttribute('name');
    expect(cell).not.toHaveAttribute('columnId');
    expect(cell).toHaveAttribute('data-column-id', 'title');
  });

  it('stamps data-row-id from rowId', () => {
    const { container } = renderTable();
    expect(container.querySelector('[data-row-id="b"]')).not.toBeNull();
  });

  it('scrollToRow returns true for a mounted row and false otherwise', () => {
    const ref = createRef<TableLayoutHandle>();
    renderTable(ref);
    const spy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');
    expect(ref.current?.scrollToRow('b')).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(ref.current?.scrollToRow('missing')).toBe(false);
    spy.mockRestore();
  });
});
```

- [ ] **Step 3: Run the test to verify it passes**

Run: `pnpm test:run src/components/TableLayout/__tests__/TableLayout.test.tsx`
Expected: PASS (5 passed). `scrollIntoView` is a no-op stub from `vitest.setup.ts`; the spy confirms the call.

- [ ] **Step 4: Lint and typecheck the whole component**

Run: `pnpm lint && pnpm typecheck`
Expected: PASS (Biome clean, tsc no errors).

- [ ] **Step 5: Commit (checkpoint)**

```bash
git add src/components/TableLayout/index.ts src/components/TableLayout/__tests__/TableLayout.test.tsx
git commit -m "feat(table-layout): public exports and Tier-0 integration test"
```

---

## Self-Review

**Spec coverage (Layer 1 portion of `2026-06-30-table-layout-design.md`):**
- Primitives `TableLayout/TableLayoutHead/TableLayoutBody/TableLayoutRow/TableLayoutHeaderCell/TableLayoutCell/TableLayoutColumnGroup/TableLayoutColumn` → Tasks 3–9. ✅
- `columnId` registry, context-based, no DOM leak → Tasks 2, 7, 9 (leak test). ✅
- `align` inherited via registry (§10.5) → Tasks 1, 7, 8, 9. ✅
- Sticky header / horizontal scroll container → Tasks 1, 4 (`tableLayoutHead`, `tableLayoutContainer`). ✅
- `scrollToRow` handle, non-virtualized DOM path, `rowId` on `TableLayoutRow` (§10.3) → Tasks 1, 3, 5, 9. ✅
- Independent from `Table`, native `<table>` foundation (§8, under-the-hood decision) → Global Constraints + no `Table/*` imports + real `<table>` elements. ✅
- Layers 2–4 features (sort/selection/pin/resize/virtualization/menus/facade) → out of scope, deferred to roadmap plans 2–10. ✅ (intentional)

**Placeholder scan:** No TBD/TODO; every code step has complete code; every command has expected output. ✅

**Type consistency:** `TableLayoutColumnPresentation { align, pin, width }` used identically in Tasks 1/2/7/8. `TableLayoutHandle.scrollToRow(id, opts)` signature identical in Tasks 1/3/9. `registerColumn/unregisterColumn/getColumn` names identical across Tasks 2/3/7/8. `columnId` prop name consistent on `TableLayoutColumn` and `TableLayoutCell`. ✅

**Note for executor:** `pnpm test:run <path>` runs a single file. If the DS Vitest config doesn't accept a path positional, use `pnpm test:run -- <path>` or `pnpm exec vitest run <path>`.
