# TableLayout — Layer 2: Column Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add the column engine to `TableLayout` — pinning (sticky offsets), resizing, and visibility — as a single headless **controller hook** `useTableLayoutColumns`, plus make the component metrics-ready per the DS analytics contract.

**Architecture (controller-hook):** A pure `computeColumnLayout(defs, state)` resolves each column to `{ align, hidden, resizable, width, minWidth, maxWidth, pin, stickyStyle, lastPinnedLeft, firstPinnedRight }`. `useTableLayoutColumns(defs, options)` is the **sole engine**: it owns `columnSizing`/`columnVisibility`/`columnPinning` via `useControlled`, runs `computeColumnLayout`, and returns `{ columns, controller }`. The consumer renders `columns.map(c => <TableLayoutColumn {...c} />)` inside a dumb `<TableLayoutColumnGroup>` and hands `controller` to the **root**: `<TableLayout controller={controller}>`. The root publishes the engine into context (it is the common ancestor of `<colgroup>`/`<thead>`/`<tbody>`, so the resize handle in a `<th>` and cells in `<tbody>` all reach it). `TableLayout.getColumn(id)` returns `controller.resolved[id]` and falls back to the Layer-1 self-registration registry for the hook-less hand-written path. Cells/header cells consume the resolved presentation (sticky pin styles, resize handle, self-hide). Metrics: pinning is exempt; the resize handle is a documented closed/drag-target gap whose seam is `onColumnSizingChange`.

**Tech Stack:** React 19 · TypeScript · Tailwind v4 (DS tokens) · class-variance-authority · `useControlled` (`src/hooks/useControlled.ts`) · Vitest + @testing-library/react · Biome.

**Builds on:** `2026-06-30-table-layout-foundation.md` (Layer 1, complete on branch `feat/table-layout-foundation`). **Spec:** `../specs/2026-06-30-table-layout-design.md` (§6 rows 5/6/10; §10.2 — note: the imperative hook is now THE engine, not an "alternative"; declarative `<TableLayoutColumn>` remains the render form). **Metrics:** `docs/metrics/contract.md`, `docs/metrics/new-component-checklist.md`.

## Global Constraints

- **Implementation repo/dir:** `/Users/half/Source/wallarm-cloud/ds/packages/design-system`. All paths relative to it; commands run from it. Continue on branch `feat/table-layout-foundation`.
- **Independent from the existing `Table`:** no imports from `src/components/Table/*`. Reimplement pin/resize logic; do not import `getPinningStyles`/`isLastPinnedLeft` (TanStack-bound).
- **Naming:** flat PascalCase, fully prefixed `TableLayout*`. The engine controller prop is `controller` (on `<TableLayout>`).
- **Spacing:** 4px grid only; 1–2px only for borders/hairlines.
- **`columnId` never reaches the DOM as `id`/`name`** — only `data-column-id`.
- **Metrics (DS contract):** vendor-neutral pass-through — NO analytics-specific props. New interactive targets spread `{...rest}`. The resize handle is a closed/drag target → its analytics seam is the `onColumnSizingChange` callback, recorded as a gap in `ANALYTICS_GAPS.md`. Never `JSON.parse`/reserialize `data-analytics-props`.
- **State model:** `useControlled<T>({ controlled, default })` → `[value, setValue]` (no-op setter when controlled). Uncontrolled by default.
- **Pinned columns must declare `width`** (offset math needs it); missing width counts as 0, never crash.
- **Engine features require the controller hook.** A hand-written `<TableLayoutColumn pin>` without the hook gets only basic Layer-1 resolution (align/width) — no computed pin offsets. This is intended (Tier-0/1 = markup; Tier-2 = hook).
- **Re-registration safety:** `TableLayoutColumn` self-registration must key its effect on **primitive** props only (not on a freshly-built resolved object), or it loops. Follow the code exactly.
- **Tooling:** `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run <path>`. Single quotes, semicolons, 2-space indent, width 100. **Run `pnpm lint` before every commit** (the auto-format hook does NOT run in this repo — Layer 1 lesson).
- **Commits:** per-task commits on this branch ARE authorized (user approved). Do NOT push.

---

## File Structure (this plan)

Under `src/components/TableLayout/`:
- `types.ts` — **modify**: add engine types (`TableLayoutColumnDef`, `TableLayoutColumnResolved`, `TableLayoutColumnResizeMode`, `TableLayoutColumnSizingState`/`VisibilityState`/`PinningState`, `TableLayoutColumnController`, `TableLayoutColumnRenderProps`); keep `TableLayoutColumnPresentation` as a `TableLayoutColumnResolved` alias.
- `lib/computeColumnLayout.ts` + `lib/__tests__/computeColumnLayout.test.ts` — **create**.
- `useTableLayoutColumns.ts` + `__tests__/useTableLayoutColumns.test.ts` — **create**: the controller hook.
- `TableLayoutContext.ts` — **modify**: registry stores resolved; add engine slice (`resizeMode`, optional `setColumnSize`).
- `primitives/TableLayout.tsx` — **modify**: `controller` prop; `getColumn` precedence; provide engine slice.
- `primitives/TableLayoutColumn.tsx` — **modify**: self-register a computed basic resolved (primitive-keyed effect); render `<col>`/self-hide.
- `classes.ts` — **modify**: pinned + resize-handle classes.
- `primitives/TableLayoutCell.tsx` / `primitives/TableLayoutHeaderCell.tsx` — **modify**: apply pin sticky + classes; self-hide; header renders resize handle.
- `primitives/TableLayoutResizeHandle.tsx` — **create**.
- `ANALYTICS_GAPS.md` — **create**.
- `index.ts` — **modify**: export hook + engine types + resize handle.
- `__tests__/TableLayoutColumnEngine.test.tsx` — **create**: Layer-2 integration test (grows across tasks).

`TableLayoutColumnGroup` needs **no change** (already a dumb `<colgroup>` from Layer 1).

---

### Task 1: Engine types + `computeColumnLayout` pure resolver

**Files:**
- Modify: `src/components/TableLayout/types.ts`
- Create: `src/components/TableLayout/lib/computeColumnLayout.ts`
- Test: `src/components/TableLayout/lib/__tests__/computeColumnLayout.test.ts`

**Interfaces:**
- Consumes: `TableLayoutColumnAlign`, `TableLayoutColumnPin` (Layer 1).
- Produces: the engine types listed below and `computeColumnLayout(defs, state?) → { resolved, order }`.

- [ ] **Step 1: Add the types** (append to `types.ts`; keep all existing exports). Add `import type { CSSProperties } from 'react';` at the top if not present.

```ts
export type TableLayoutColumnResizeMode = 'onChange' | 'onEnd';
export type TableLayoutColumnSizingState = Record<string, number>;
export type TableLayoutColumnVisibilityState = Record<string, boolean>;
export interface TableLayoutColumnPinningState {
  left?: string[];
  right?: string[];
}

/** Declared column definition — props of `TableLayoutColumn` and entries to `useTableLayoutColumns`. */
export interface TableLayoutColumnDef {
  columnId: string;
  align?: TableLayoutColumnAlign;
  pin?: TableLayoutColumnPin;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  hidden?: boolean;
}

/** Resolved per-column presentation stored in the registry / carried by the controller. */
export interface TableLayoutColumnResolved {
  align?: TableLayoutColumnAlign;
  hidden: boolean;
  resizable: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  pin?: TableLayoutColumnPin;
  /** Sticky positioning for a pinned cell; `{}` when not pinned. */
  stickyStyle: CSSProperties;
  lastPinnedLeft: boolean;
  firstPinnedRight: boolean;
}

/** Per-column render descriptor returned by the hook to spread onto `TableLayoutColumn`. */
export interface TableLayoutColumnRenderProps {
  columnId: string;
  align?: TableLayoutColumnAlign;
  pin?: TableLayoutColumnPin;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
}

/** Engine controller handed to `<TableLayout controller={...}>`. */
export interface TableLayoutColumnController {
  resolved: Record<string, TableLayoutColumnResolved>;
  resizeMode: TableLayoutColumnResizeMode;
  setColumnSize: (columnId: string, width: number) => void;
}

/** @deprecated Use TableLayoutColumnResolved. Kept so Layer-1 imports resolve. */
export type TableLayoutColumnPresentation = TableLayoutColumnResolved;
```

> **Coupling caution (learned in execution):** aliasing `TableLayoutColumnPresentation` to the
> wider `TableLayoutColumnResolved` widens the registry value type, which **breaks the only
> constructor of it — the Layer-1 `TableLayoutColumn`** (it registered a narrow `{ align, pin, width }`).
> So this task MUST also migrate `TableLayoutColumn` to register a full resolved (see Step 7),
> and MUST verify with a **clean** typecheck (`pnpm exec tsc --noEmit -p tsconfig.app.json`) —
> the incremental `tsc` cache hides the break because `TableLayoutColumn.tsx` is unchanged in
> a types-only commit. Task 3 therefore no longer touches `TableLayoutColumn`.

- [ ] **Step 2: Write the failing test**

```ts
// src/components/TableLayout/lib/__tests__/computeColumnLayout.test.ts
import { describe, expect, it } from 'vitest';
import { computeColumnLayout } from '../computeColumnLayout';

const defs = [
  { columnId: 'a', pin: 'left' as const, width: 100 },
  { columnId: 'b', pin: 'left' as const, width: 60 },
  { columnId: 'c', width: 200 },
  { columnId: 'd', pin: 'right' as const, width: 48 },
];

describe('computeColumnLayout', () => {
  it('stacks left-pinned offsets and flags the last left-pinned', () => {
    const { resolved } = computeColumnLayout(defs);
    expect(resolved.a.stickyStyle).toEqual({ position: 'sticky', left: '0px' });
    expect(resolved.b.stickyStyle).toEqual({ position: 'sticky', left: '100px' });
    expect(resolved.a.lastPinnedLeft).toBe(false);
    expect(resolved.b.lastPinnedLeft).toBe(true);
    expect(resolved.c.stickyStyle).toEqual({});
  });

  it('computes right-pinned offset from the right edge and flags first-right', () => {
    const { resolved } = computeColumnLayout(defs);
    expect(resolved.d.stickyStyle).toEqual({ position: 'sticky', right: '0px' });
    expect(resolved.d.firstPinnedRight).toBe(true);
  });

  it('drops hidden columns from order and from offset math', () => {
    const { resolved, order } = computeColumnLayout(defs, { visibility: { b: false } });
    expect(order).toEqual(['a', 'c', 'd']);
    expect(resolved.b.hidden).toBe(true);
    expect(resolved.a.lastPinnedLeft).toBe(true);
  });

  it('applies sizing-state width over the declared width', () => {
    const { resolved } = computeColumnLayout(defs, { sizing: { a: 140 } });
    expect(resolved.a.width).toBe(140);
    expect(resolved.b.stickyStyle.left).toBe('140px');
  });

  it('applies a pinning-state override over the declared pin', () => {
    const { resolved } = computeColumnLayout(defs, { pinning: { left: ['c'] } });
    expect(resolved.c.pin).toBe('left');
    expect(resolved.c.stickyStyle.position).toBe('sticky');
  });
});
```

- [ ] **Step 3: Run to confirm fail**

Run: `pnpm exec vitest run src/components/TableLayout/lib/__tests__/computeColumnLayout.test.ts`
Expected: FAIL — cannot resolve `../computeColumnLayout`.

- [ ] **Step 4: Implement the resolver**

```ts
// src/components/TableLayout/lib/computeColumnLayout.ts
import type { CSSProperties } from 'react';
import type {
  TableLayoutColumnDef,
  TableLayoutColumnPin,
  TableLayoutColumnPinningState,
  TableLayoutColumnResolved,
  TableLayoutColumnSizingState,
  TableLayoutColumnVisibilityState,
} from '../types';

interface ColumnLayoutState {
  sizing?: TableLayoutColumnSizingState;
  visibility?: TableLayoutColumnVisibilityState;
  pinning?: TableLayoutColumnPinningState;
}

export const computeColumnLayout = (
  defs: TableLayoutColumnDef[],
  state: ColumnLayoutState = {},
): { resolved: Record<string, TableLayoutColumnResolved>; order: string[] } => {
  const { sizing = {}, visibility = {}, pinning } = state;

  const pinOf = (def: TableLayoutColumnDef): TableLayoutColumnPin | undefined => {
    if (pinning?.left?.includes(def.columnId)) return 'left';
    if (pinning?.right?.includes(def.columnId)) return 'right';
    return def.pin;
  };
  const hiddenOf = (def: TableLayoutColumnDef): boolean =>
    def.columnId in visibility ? !visibility[def.columnId] : !!def.hidden;
  const widthOf = (def: TableLayoutColumnDef): number | undefined =>
    sizing[def.columnId] ?? def.width;

  const resolved: Record<string, TableLayoutColumnResolved> = {};
  const base = (def: TableLayoutColumnDef, extra: Partial<TableLayoutColumnResolved>) => ({
    align: def.align,
    hidden: false,
    resizable: !!def.resizable,
    width: widthOf(def),
    minWidth: def.minWidth,
    maxWidth: def.maxWidth,
    pin: undefined,
    stickyStyle: {} as CSSProperties,
    lastPinnedLeft: false,
    firstPinnedRight: false,
    ...extra,
  });

  const visible = defs.filter(d => !hiddenOf(d));
  const leftPinned = visible.filter(d => pinOf(d) === 'left');
  const rightPinned = visible.filter(d => pinOf(d) === 'right');
  const lastLeftId = leftPinned.at(-1)?.columnId;
  const firstRightId = rightPinned[0]?.columnId;

  const rightOffset: Record<string, number> = {};
  let rightAcc = 0;
  // Iterator form (not index access) so TS types `def` as non-undefined under strictNullChecks.
  for (const def of rightPinned.slice().reverse()) {
    rightOffset[def.columnId] = rightAcc;
    rightAcc += widthOf(def) ?? 0;
  }

  let leftAcc = 0;
  for (const def of visible) {
    const pin = pinOf(def);
    let stickyStyle: CSSProperties = {};
    if (pin === 'left') {
      stickyStyle = { position: 'sticky', left: `${leftAcc}px` };
      leftAcc += widthOf(def) ?? 0;
    } else if (pin === 'right') {
      stickyStyle = { position: 'sticky', right: `${rightOffset[def.columnId]}px` };
    }
    resolved[def.columnId] = base(def, {
      pin,
      stickyStyle,
      lastPinnedLeft: def.columnId === lastLeftId,
      firstPinnedRight: def.columnId === firstRightId,
    });
  }

  for (const def of defs) {
    if (hiddenOf(def)) resolved[def.columnId] = base(def, { hidden: true });
  }

  return { resolved, order: visible.map(d => d.columnId) };
};
```

- [ ] **Step 5: Run to confirm pass**

Run: `pnpm exec vitest run src/components/TableLayout/lib/__tests__/computeColumnLayout.test.ts`
Expected: PASS (5 passed).

- [ ] **Step 6: Migrate `TableLayoutColumn` to register a full resolved** (required because the alias widened the registry value — otherwise the Layer-1 primitive no longer type-checks). Use the implementation from Task 3 Step 3 (primitive-keyed effect, `computeColumnLayout([def])`, self-hide). Expand `TableLayoutColumnProps` to `TableLayoutColumnDef`.

- [ ] **Step 7: Clean typecheck, lint, commit**

Run a **clean** typecheck (the incremental cache hides the break): `pnpm exec tsc --noEmit -p tsconfig.app.json` → 0 errors in `src/components/TableLayout/**`. Then `pnpm lint && pnpm typecheck` → PASS.
```bash
git add src/components/TableLayout/types.ts src/components/TableLayout/lib/computeColumnLayout.ts src/components/TableLayout/lib/__tests__/computeColumnLayout.test.ts src/components/TableLayout/primitives/TableLayoutColumn.tsx
git commit -m "feat(table-layout): column layout resolver, engine types, column migration"
```

---

### Task 2: `useTableLayoutColumns` controller hook

**Files:**
- Create: `src/components/TableLayout/useTableLayoutColumns.ts`
- Test: `src/components/TableLayout/__tests__/useTableLayoutColumns.test.ts`

**Interfaces:**
- Consumes: `computeColumnLayout` (Task 1), `useControlled` from `../../hooks/useControlled`.
- Produces: `useTableLayoutColumns(defs, options?) → { columns: TableLayoutColumnRenderProps[]; controller: TableLayoutColumnController }`.
  - `options`: `{ columnSizing?; onColumnSizingChange?; columnVisibility?; onColumnVisibilityChange?; columnPinning?; onColumnPinningChange?; columnResizeMode? }`.
  - `columns` = the **visible** columns in order, each a render descriptor (columnId + declared props) for `<TableLayoutColumn>`.
  - `controller.resolved` = the **full** resolved map (incl. hidden, so cells can self-hide); `controller.setColumnSize` updates sizing (uncontrolled) and fires `onColumnSizingChange`; `controller.resizeMode` (default `'onEnd'`).

- [ ] **Step 1: Write the failing test**

```ts
// src/components/TableLayout/__tests__/useTableLayoutColumns.test.ts
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTableLayoutColumns } from '../useTableLayoutColumns';

const defs = [
  { columnId: 'a', pin: 'left' as const, width: 100, resizable: true, minWidth: 80 },
  { columnId: 'b', width: 50 },
  { columnId: 'c', width: 50, hidden: true },
];

describe('useTableLayoutColumns', () => {
  it('returns visible columns in order and a full resolved map', () => {
    const { result } = renderHook(() => useTableLayoutColumns(defs));
    expect(result.current.columns.map(c => c.columnId)).toEqual(['a', 'b']); // c hidden
    expect(result.current.controller.resolved.a.stickyStyle).toEqual({ position: 'sticky', left: '0px' });
    expect(result.current.controller.resolved.c.hidden).toBe(true); // present for self-hide
  });

  it('setColumnSize (uncontrolled) updates width and fires onColumnSizingChange', () => {
    const onSizing = vi.fn();
    const { result } = renderHook(() => useTableLayoutColumns(defs, { onColumnSizingChange: onSizing }));
    act(() => result.current.controller.setColumnSize('a', 140));
    expect(onSizing).toHaveBeenCalledWith({ a: 140 });
    expect(result.current.controller.resolved.a.width).toBe(140);
  });

  it('is controlled when columnSizing is provided (internal state does not change)', () => {
    const onSizing = vi.fn();
    const { result } = renderHook(() =>
      useTableLayoutColumns(defs, { columnSizing: { a: 200 }, onColumnSizingChange: onSizing }),
    );
    expect(result.current.controller.resolved.a.width).toBe(200);
    act(() => result.current.controller.setColumnSize('a', 140));
    expect(onSizing).toHaveBeenCalledWith({ a: 140 });
    expect(result.current.controller.resolved.a.width).toBe(200); // controlled → unchanged
  });
});
```

- [ ] **Step 2: Run to confirm fail**

Run: `pnpm exec vitest run src/components/TableLayout/__tests__/useTableLayoutColumns.test.ts`
Expected: FAIL — cannot resolve `../useTableLayoutColumns`.

- [ ] **Step 3: Implement the hook**

```ts
// src/components/TableLayout/useTableLayoutColumns.ts
import { useCallback, useMemo } from 'react';
import { useControlled } from '../../hooks/useControlled';
import { computeColumnLayout } from './lib/computeColumnLayout';
import type {
  TableLayoutColumnController,
  TableLayoutColumnDef,
  TableLayoutColumnPinningState,
  TableLayoutColumnRenderProps,
  TableLayoutColumnResizeMode,
  TableLayoutColumnSizingState,
  TableLayoutColumnVisibilityState,
} from './types';

export interface UseTableLayoutColumnsOptions {
  columnSizing?: TableLayoutColumnSizingState;
  onColumnSizingChange?: (next: TableLayoutColumnSizingState) => void;
  columnVisibility?: TableLayoutColumnVisibilityState;
  onColumnVisibilityChange?: (next: TableLayoutColumnVisibilityState) => void;
  columnPinning?: TableLayoutColumnPinningState;
  onColumnPinningChange?: (next: TableLayoutColumnPinningState) => void;
  columnResizeMode?: TableLayoutColumnResizeMode;
}

const toRenderProps = (def: TableLayoutColumnDef): TableLayoutColumnRenderProps => ({
  columnId: def.columnId,
  align: def.align,
  pin: def.pin,
  width: def.width,
  minWidth: def.minWidth,
  maxWidth: def.maxWidth,
  resizable: def.resizable,
});

export const useTableLayoutColumns = (
  defs: TableLayoutColumnDef[],
  options: UseTableLayoutColumnsOptions = {},
): { columns: TableLayoutColumnRenderProps[]; controller: TableLayoutColumnController } => {
  const {
    columnSizing,
    onColumnSizingChange,
    columnVisibility,
    columnPinning,
    columnResizeMode = 'onEnd',
  } = options;

  const [sizing, setSizing] = useControlled<TableLayoutColumnSizingState>({
    controlled: columnSizing,
    default: {},
  });
  const [visibility] = useControlled<TableLayoutColumnVisibilityState>({
    controlled: columnVisibility,
    default: {},
  });

  const { resolved, order } = useMemo(
    () => computeColumnLayout(defs, { sizing, visibility, pinning: columnPinning }),
    [defs, sizing, visibility, columnPinning],
  );

  const setColumnSize = useCallback(
    (columnId: string, width: number) => {
      const next = { ...(sizing ?? {}), [columnId]: width };
      setSizing(next);
      onColumnSizingChange?.(next);
    },
    [sizing, setSizing, onColumnSizingChange],
  );

  const defById = useMemo(() => new Map(defs.map(d => [d.columnId, d])), [defs]);
  const columns = useMemo(
    () => order.map(id => toRenderProps(defById.get(id) as TableLayoutColumnDef)),
    [order, defById],
  );

  const controller = useMemo<TableLayoutColumnController>(
    () => ({ resolved, resizeMode: columnResizeMode, setColumnSize }),
    [resolved, columnResizeMode, setColumnSize],
  );

  return { columns, controller };
};
```

- [ ] **Step 4: Run to confirm pass**

Run: `pnpm exec vitest run src/components/TableLayout/__tests__/useTableLayoutColumns.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 5: Lint, typecheck, commit**

Run: `pnpm lint && pnpm typecheck` → PASS.
```bash
git add src/components/TableLayout/useTableLayoutColumns.ts src/components/TableLayout/__tests__/useTableLayoutColumns.test.ts
git commit -m "feat(table-layout): useTableLayoutColumns controller hook"
```

---

### Task 3: Wire the controller into the root + self-registering column

**Files:**
- Modify: `src/components/TableLayout/TableLayoutContext.ts`
- Modify: `src/components/TableLayout/primitives/TableLayout.tsx`
- Modify: `src/components/TableLayout/primitives/TableLayoutColumn.tsx`
- Test: extend `__tests__/TableLayoutColumnEngine.test.tsx` (create)

**Interfaces:**
- Produces:
  - Context value: `getColumn` returns `TableLayoutColumnResolved`; new engine slice `resizeMode: TableLayoutColumnResizeMode` and `setColumnSize?: (columnId, width) => void` (undefined ⇒ no engine present).
  - `TableLayout` gains `controller?: TableLayoutColumnController`; `getColumn(id) = controller.resolved[id] ?? registry.getColumn(id)`; provides `resizeMode`/`setColumnSize` from the controller.
  - `TableLayoutColumn` registers a computed basic resolved (so the hand-written path still inherits align) and self-hides when `hidden`.

- [ ] **Step 1: Update the context** (registry value type + engine slice)

```ts
// src/components/TableLayout/TableLayoutContext.ts
import { createContext, type RefObject, useContext } from 'react';
import type { TableLayoutColumnResizeMode, TableLayoutColumnResolved } from './types';

export interface TableLayoutContextValue {
  registerColumn: (id: string, meta: TableLayoutColumnResolved) => void;
  unregisterColumn: (id: string) => void;
  getColumn: (id: string) => TableLayoutColumnResolved | undefined;
  containerRef: RefObject<HTMLDivElement | null>;
  resizeMode: TableLayoutColumnResizeMode;
  /** Present only when a controller engine is attached (`<TableLayout controller>`). */
  setColumnSize?: (columnId: string, width: number) => void;
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

- [ ] **Step 2: Update `TableLayout`** to accept `controller` and resolve `getColumn` precedence

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
import type { TableLayoutColumnController, TableLayoutHandle } from '../types';
import { useColumnRegistry } from '../useColumnRegistry';

export interface TableLayoutProps extends Omit<ComponentPropsWithRef<'table'>, 'ref'> {
  /** Column engine controller from `useTableLayoutColumns` — enables pin/resize/visibility. */
  controller?: TableLayoutColumnController;
}

export const TableLayout = forwardRef<TableLayoutHandle, TableLayoutProps>(
  ({ className, children, controller, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { registerColumn, unregisterColumn, getColumn: getRegistered } = useColumnRegistry();

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
      () => ({
        registerColumn,
        unregisterColumn,
        getColumn: (id: string) => controller?.resolved[id] ?? getRegistered(id),
        containerRef,
        resizeMode: controller?.resizeMode ?? 'onEnd',
        setColumnSize: controller?.setColumnSize,
      }),
      [registerColumn, unregisterColumn, getRegistered, controller],
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

- [ ] **Step 3: `TableLayoutColumn` — already migrated in Task 1 Step 6.** No change here. (It self-registers a computed basic resolved via a primitive-keyed effect and self-hides; with a controller present, `TableLayout.getColumn` prefers `controller.resolved`, so the self-registered value is shadowed — harmless. Without a controller, it is the source, preserving Layer-1 align inheritance.) Confirm the file already matches before proceeding.

- [ ] **Step 4: Write the failing integration test**

```tsx
// src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  TableLayout,
  TableLayoutBody,
  TableLayoutCell,
  TableLayoutColumn,
  TableLayoutColumnGroup,
  TableLayoutHead,
  TableLayoutHeaderCell,
  TableLayoutRow,
  useTableLayoutColumns,
} from '..';

const HookTable = ({ visibility }: { visibility?: Record<string, boolean> }) => {
  const { columns, controller } = useTableLayoutColumns(
    [
      { columnId: 'name', width: 120, align: 'left' },
      { columnId: 'count', width: 80, align: 'right' },
      { columnId: 'gone', width: 40 },
    ],
    { columnVisibility: visibility },
  );
  return (
    <TableLayout aria-label='Engine' controller={controller}>
      <TableLayoutColumnGroup>
        {columns.map(c => (
          <TableLayoutColumn key={c.columnId} {...c} />
        ))}
      </TableLayoutColumnGroup>
      <TableLayoutHead>
        <TableLayoutRow>
          <TableLayoutHeaderCell columnId='name'>Name</TableLayoutHeaderCell>
          <TableLayoutHeaderCell columnId='count'>Count</TableLayoutHeaderCell>
          <TableLayoutHeaderCell columnId='gone'>Gone</TableLayoutHeaderCell>
        </TableLayoutRow>
      </TableLayoutHead>
      <TableLayoutBody>
        <TableLayoutRow rowId='r1'>
          <TableLayoutCell columnId='name'>Alpha</TableLayoutCell>
          <TableLayoutCell columnId='count'>7</TableLayoutCell>
          <TableLayoutCell columnId='gone'>x</TableLayoutCell>
        </TableLayoutRow>
      </TableLayoutBody>
    </TableLayout>
  );
};

describe('TableLayout column engine — controller wiring', () => {
  it('inherits align via the controller resolved map', () => {
    render(<HookTable />);
    expect(screen.getByRole('cell', { name: '7' })).toHaveClass('text-right');
    expect(screen.getByRole('cell', { name: 'Alpha' })).not.toHaveClass('text-right');
  });

  it('renders one <col> per visible column', () => {
    const { container } = render(<HookTable />);
    expect(container.querySelectorAll('colgroup > col')).toHaveLength(3);
  });
});
```

- [ ] **Step 5: Run the test + the Layer-1 suite (no regression)**

Run: `pnpm exec vitest run src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx` → PASS (2).
Run: `pnpm exec vitest run src/components/TableLayout/__tests__/TableLayout.test.tsx` → still 5 passed (hand-written path: `TableLayoutColumn` now registers a computed basic resolved, align still inherited).

- [ ] **Step 6: Lint, typecheck, commit**

Run: `pnpm lint && pnpm typecheck` → PASS.
```bash
git add src/components/TableLayout/TableLayoutContext.ts src/components/TableLayout/primitives/TableLayout.tsx src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx
git commit -m "feat(table-layout): root controller wiring for the column engine"
```

---

### Task 4: Pinning — sticky styles on cells and header cells

**Files:**
- Modify: `src/components/TableLayout/classes.ts`
- Modify: `src/components/TableLayout/primitives/TableLayoutCell.tsx`
- Modify: `src/components/TableLayout/primitives/TableLayoutHeaderCell.tsx`
- Test: extend `__tests__/TableLayoutColumnEngine.test.tsx`

**Interfaces:**
- Consumes: `getColumn(columnId)` → resolved with `stickyStyle`, `pin`, `lastPinnedLeft`, `firstPinnedRight`.
- Produces: pinned cells/header cells render `position: sticky` with the resolved offset plus pin classes; last-left-pinned gets a right-edge shadow, first-right-pinned a left-edge divider.

- [ ] **Step 1: Add pin classes** to `classes.ts`

```ts
export const tableLayoutPinned = cn('z-20 bg-bg-light-primary');
export const tableLayoutLastPinnedLeft = cn(
  'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)] [clip-path:inset(0_-8px_0_0)]',
);
export const tableLayoutFirstPinnedRight = cn('border-l border-border-primary-light');
```

- [ ] **Step 2: Extend `TableLayoutCell`** (keep align + no-leak)

```tsx
// src/components/TableLayout/primitives/TableLayoutCell.tsx
import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import {
  cellAlignClass,
  tableLayoutCell,
  tableLayoutFirstPinnedRight,
  tableLayoutLastPinnedLeft,
  tableLayoutPinned,
} from '../classes';
import { useTableLayoutContext } from '../TableLayoutContext';

export interface TableLayoutCellProps extends ComponentPropsWithRef<'td'> {
  columnId?: string;
}

export const TableLayoutCell = forwardRef<HTMLTableCellElement, TableLayoutCellProps>(
  ({ className, columnId, style, ...props }, ref) => {
    const { getColumn } = useTableLayoutContext();
    const resolved = columnId ? getColumn(columnId) : undefined;
    return (
      <td
        ref={ref}
        data-column-id={columnId}
        className={cn(
          tableLayoutCell,
          resolved?.align && cellAlignClass[resolved.align],
          resolved?.pin && tableLayoutPinned,
          resolved?.lastPinnedLeft && tableLayoutLastPinnedLeft,
          resolved?.firstPinnedRight && tableLayoutFirstPinnedRight,
          className,
        )}
        style={{ ...resolved?.stickyStyle, ...style }}
        {...props}
      />
    );
  },
);
TableLayoutCell.displayName = 'TableLayoutCell';
```

- [ ] **Step 3: Extend `TableLayoutHeaderCell`** (gains optional `columnId`)

```tsx
// src/components/TableLayout/primitives/TableLayoutHeaderCell.tsx
import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import {
  tableLayoutFirstPinnedRight,
  tableLayoutHeaderCell,
  tableLayoutLastPinnedLeft,
  tableLayoutPinned,
} from '../classes';
import { useTableLayoutContext } from '../TableLayoutContext';

export interface TableLayoutHeaderCellProps extends ComponentPropsWithRef<'th'> {
  columnId?: string;
}

export const TableLayoutHeaderCell = forwardRef<
  HTMLTableCellElement,
  TableLayoutHeaderCellProps
>(({ className, columnId, style, ...props }, ref) => {
  const { getColumn } = useTableLayoutContext();
  const resolved = columnId ? getColumn(columnId) : undefined;
  return (
    <th
      ref={ref}
      scope='col'
      data-column-id={columnId}
      className={cn(
        tableLayoutHeaderCell,
        resolved?.pin && tableLayoutPinned,
        resolved?.lastPinnedLeft && tableLayoutLastPinnedLeft,
        resolved?.firstPinnedRight && tableLayoutFirstPinnedRight,
        className,
      )}
      style={{ ...resolved?.stickyStyle, ...style }}
      {...props}
    />
  );
});
TableLayoutHeaderCell.displayName = 'TableLayoutHeaderCell';
```

- [ ] **Step 4: Add the failing pin test**

```tsx
describe('TableLayout column engine — pinning', () => {
  const Pinned = () => {
    const { columns, controller } = useTableLayoutColumns([
      { columnId: 'a', width: 100, pin: 'left' },
      { columnId: 'b', width: 60, pin: 'left' },
      { columnId: 'c', width: 200 },
    ]);
    return (
      <TableLayout aria-label='Pinned' controller={controller}>
        <TableLayoutColumnGroup>
          {columns.map(c => <TableLayoutColumn key={c.columnId} {...c} />)}
        </TableLayoutColumnGroup>
        <TableLayoutBody>
          <TableLayoutRow rowId='r1'>
            <TableLayoutCell columnId='a'>A</TableLayoutCell>
            <TableLayoutCell columnId='b'>B</TableLayoutCell>
            <TableLayoutCell columnId='c'>C</TableLayoutCell>
          </TableLayoutRow>
        </TableLayoutBody>
      </TableLayout>
    );
  };

  it('applies cumulative sticky offsets and the last-pinned-left boundary class', () => {
    render(<Pinned />);
    const a = screen.getByRole('cell', { name: 'A' });
    const b = screen.getByRole('cell', { name: 'B' });
    expect(a).toHaveStyle({ position: 'sticky', left: '0px' });
    expect(b).toHaveStyle({ position: 'sticky', left: '100px' });
    expect(b.className).toContain('shadow-');
    expect(screen.getByRole('cell', { name: 'C' })).not.toHaveStyle({ position: 'sticky' });
  });
});
```

- [ ] **Step 5: Run, lint, typecheck, commit**

Run: `pnpm exec vitest run src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx` → PASS.
Run: `pnpm lint && pnpm typecheck` → PASS.
```bash
git add src/components/TableLayout/classes.ts src/components/TableLayout/primitives/TableLayoutCell.tsx src/components/TableLayout/primitives/TableLayoutHeaderCell.tsx src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx
git commit -m "feat(table-layout): column pinning sticky styles on cells and headers"
```

---

### Task 5: Resizing — `TableLayoutResizeHandle` wired to the controller

**Files:**
- Create: `src/components/TableLayout/primitives/TableLayoutResizeHandle.tsx`
- Modify: `src/components/TableLayout/classes.ts` (handle class)
- Modify: `src/components/TableLayout/primitives/TableLayoutHeaderCell.tsx` (render handle when resizable AND an engine is attached)
- Test: extend `__tests__/TableLayoutColumnEngine.test.tsx`

**Interfaces:**
- Consumes: context `setColumnSize` (undefined ⇒ no handle), `resizeMode`, `getColumn(columnId)` (current width + clamp bounds).
- Produces: `TableLayoutResizeHandle` — a pointer-drag `<div role="separator">` forwarding `{...rest}`; calls `setColumnSize`.

- [ ] **Step 1: Add handle class** to `classes.ts`

```ts
export const tableLayoutResizeHandle = cn(
  'absolute top-0 bottom-0 right-0 w-8 translate-x-4 z-30',
  'cursor-col-resize select-none touch-none',
  'opacity-0 hover:opacity-100 data-[resizing]:opacity-100 transition-opacity',
  'before:absolute before:inset-y-4 before:right-4 before:w-2 before:rounded-2 before:bg-bg-fill-brand',
);
```

- [ ] **Step 2: Implement the handle**

```tsx
// src/components/TableLayout/primitives/TableLayoutResizeHandle.tsx
import { type ComponentPropsWithRef, forwardRef, type PointerEvent, useRef, useState } from 'react';
import { cn } from '../../../utils/cn';
import { tableLayoutResizeHandle } from '../classes';
import { useTableLayoutContext } from '../TableLayoutContext';

export interface TableLayoutResizeHandleProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  columnId: string;
}

const clamp = (value: number, min?: number, max?: number): number => {
  let v = value;
  if (min !== undefined) v = Math.max(min, v);
  if (max !== undefined) v = Math.min(max, v);
  return v;
};

export const TableLayoutResizeHandle = forwardRef<HTMLDivElement, TableLayoutResizeHandleProps>(
  ({ className, columnId, onPointerDown, ...rest }, ref) => {
    const { getColumn, setColumnSize, resizeMode } = useTableLayoutContext();
    const [resizing, setResizing] = useState(false);
    const start = useRef<{ x: number; width: number }>({ x: 0, width: 0 });

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || !setColumnSize) return;
      const resolved = getColumn(columnId);
      start.current = {
        x: event.clientX,
        width: resolved?.width ?? event.currentTarget.parentElement?.offsetWidth ?? 0,
      };
      setResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);

      const widthAt = (clientX: number): number =>
        clamp(start.current.width + (clientX - start.current.x), resolved?.minWidth, resolved?.maxWidth);
      const onMove = (e: globalThis.PointerEvent) => {
        if (resizeMode === 'onChange') setColumnSize(columnId, widthAt(e.clientX));
      };
      const onUp = (e: globalThis.PointerEvent) => {
        if (resizeMode === 'onEnd') setColumnSize(columnId, widthAt(e.clientX));
        setResizing(false);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };

    return (
      <div
        ref={ref}
        role='separator'
        aria-orientation='vertical'
        data-slot='resize-handle'
        data-resizing={resizing || undefined}
        className={cn(tableLayoutResizeHandle, className)}
        onPointerDown={handlePointerDown}
        {...rest}
      />
    );
  },
);
TableLayoutResizeHandle.displayName = 'TableLayoutResizeHandle';
```

> Consumer `onPointerDown` runs first; `preventDefault()` opts out (DS event-composition). The handle no-ops without an engine (`setColumnSize` undefined). `{...rest}` reaches the `<div>`, but the canonical analytics seam is `onColumnSizingChange` (Task 7, CG-1).

- [ ] **Step 3: Render the handle from `TableLayoutHeaderCell`** — only when the column is resizable AND an engine is attached (`setColumnSize` present). Update the header cell to destructure `children` and add the handle; make `<th>` `relative`.

```tsx
// TableLayoutHeaderCell.tsx — full updated render
import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import {
  tableLayoutFirstPinnedRight,
  tableLayoutHeaderCell,
  tableLayoutLastPinnedLeft,
  tableLayoutPinned,
} from '../classes';
import { useTableLayoutContext } from '../TableLayoutContext';
import { TableLayoutResizeHandle } from './TableLayoutResizeHandle';

export interface TableLayoutHeaderCellProps extends ComponentPropsWithRef<'th'> {
  columnId?: string;
}

export const TableLayoutHeaderCell = forwardRef<
  HTMLTableCellElement,
  TableLayoutHeaderCellProps
>(({ className, columnId, style, children, ...props }, ref) => {
  const { getColumn, setColumnSize } = useTableLayoutContext();
  const resolved = columnId ? getColumn(columnId) : undefined;
  const showResize = !!columnId && !!resolved?.resizable && !!setColumnSize;
  return (
    <th
      ref={ref}
      scope='col'
      data-column-id={columnId}
      className={cn(
        'relative',
        tableLayoutHeaderCell,
        resolved?.pin && tableLayoutPinned,
        resolved?.lastPinnedLeft && tableLayoutLastPinnedLeft,
        resolved?.firstPinnedRight && tableLayoutFirstPinnedRight,
        className,
      )}
      style={{ ...resolved?.stickyStyle, ...style }}
      {...props}
    >
      {children}
      {showResize ? <TableLayoutResizeHandle columnId={columnId as string} /> : null}
    </th>
  );
});
TableLayoutHeaderCell.displayName = 'TableLayoutHeaderCell';
```

- [ ] **Step 4: Add the failing resize test** (jsdom: drive via pointer events, assert the callback). Add the `PointerEvent` shim at the top of the test file (after imports) if missing:

```tsx
if (!('PointerEvent' in window)) {
  // biome-ignore lint/suspicious/noExplicitAny: jsdom PointerEvent shim
  (window as any).PointerEvent = class extends Event {
    clientX = 0;
    pointerId = 0;
    // biome-ignore lint/suspicious/noExplicitAny: shim
    constructor(type: string, params: any = {}) {
      super(type, params);
      Object.assign(this, params);
    }
  };
}
```

```tsx
import { fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

describe('TableLayout column engine — resize', () => {
  const Resizable = ({ onSizing }: { onSizing: (s: Record<string, number>) => void }) => {
    const { columns, controller } = useTableLayoutColumns(
      [{ columnId: 'a', width: 120, resizable: true, minWidth: 80 }],
      { onColumnSizingChange: onSizing },
    );
    return (
      <TableLayout aria-label='Resize' controller={controller}>
        <TableLayoutColumnGroup>
          {columns.map(c => <TableLayoutColumn key={c.columnId} {...c} />)}
        </TableLayoutColumnGroup>
        <TableLayoutHead>
          <TableLayoutRow>
            <TableLayoutHeaderCell columnId='a'>A</TableLayoutHeaderCell>
          </TableLayoutRow>
        </TableLayoutHead>
        <TableLayoutBody>
          <TableLayoutRow rowId='r1'>
            <TableLayoutCell columnId='a'>x</TableLayoutCell>
          </TableLayoutRow>
        </TableLayoutBody>
      </TableLayout>
    );
  };

  it('fires onColumnSizingChange with the clamped width on pointer drag (onEnd)', () => {
    const onSizing = vi.fn();
    render(<Resizable onSizing={onSizing} />);
    const handle = document.querySelector('[data-slot="resize-handle"]') as HTMLElement;
    expect(handle).not.toBeNull();
    handle.setPointerCapture = () => {};
    fireEvent.pointerDown(handle, { clientX: 200, pointerId: 1 });
    // biome-ignore lint/suspicious/noExplicitAny: PointerEvent shim
    fireEvent(window, new (window as any).PointerEvent('pointermove', { clientX: 260 }));
    // biome-ignore lint/suspicious/noExplicitAny: PointerEvent shim
    fireEvent(window, new (window as any).PointerEvent('pointerup', { clientX: 260 }));
    expect(onSizing).toHaveBeenCalledWith({ a: 180 }); // 120 + (260-200) = 180 ≥ minWidth
  });
});
```

- [ ] **Step 5: Run, lint, typecheck, commit**

Run: `pnpm exec vitest run src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx` → PASS.
Run: `pnpm lint && pnpm typecheck` → PASS.
```bash
git add src/components/TableLayout/classes.ts src/components/TableLayout/primitives/TableLayoutResizeHandle.tsx src/components/TableLayout/primitives/TableLayoutHeaderCell.tsx src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx
git commit -m "feat(table-layout): column resize handle wired to the controller"
```

---

### Task 6: Visibility — engine-managed self-hide

**Files:**
- Modify: `src/components/TableLayout/primitives/TableLayoutCell.tsx`
- Modify: `src/components/TableLayout/primitives/TableLayoutHeaderCell.tsx`
- Test: extend `__tests__/TableLayoutColumnEngine.test.tsx`

**Interfaces:**
- Consumes: `getColumn(columnId)?.hidden`.
- Produces: a cell/header cell whose column resolves to `hidden` renders `null`. (The hook already excludes hidden columns from `columns`, so no `<col>` renders; `controller.resolved` still carries `hidden:true` so the hand-written body/header cells self-hide.)

- [ ] **Step 1: Self-hide in `TableLayoutCell`** — after computing `resolved`, before the return:

```tsx
const resolved = columnId ? getColumn(columnId) : undefined;
if (resolved?.hidden) return null;
```

- [ ] **Step 2: Self-hide in `TableLayoutHeaderCell`** — after computing `resolved`, before `showResize`:

```tsx
const resolved = columnId ? getColumn(columnId) : undefined;
if (resolved?.hidden) return null;
const showResize = !!columnId && !!resolved?.resizable && !!setColumnSize;
```

- [ ] **Step 3: Add the failing visibility test**

```tsx
describe('TableLayout column engine — visibility', () => {
  it('hides a column across colgroup, header, and body when visibility is false', () => {
    const { container } = render(<HookTable visibility={{ gone: false }} />);
    expect(screen.queryByRole('columnheader', { name: 'Gone' })).toBeNull();
    expect(screen.queryByRole('cell', { name: 'x' })).toBeNull();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(container.querySelectorAll('colgroup > col')).toHaveLength(2);
  });
});
```

> `HookTable` (Task 3) already declares a `gone` column and accepts `visibility`; `gone` defaults visible (3 cols) and hides here (2 cols).

- [ ] **Step 4: Run, lint, typecheck, commit**

Run: `pnpm exec vitest run src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx` → PASS.
Run: `pnpm lint && pnpm typecheck` → PASS.
```bash
git add src/components/TableLayout/primitives/TableLayoutCell.tsx src/components/TableLayout/primitives/TableLayoutHeaderCell.tsx src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx
git commit -m "feat(table-layout): engine-managed column visibility (self-hide)"
```

---

### Task 7: Metrics readiness — `ANALYTICS_GAPS.md` + resize pass-through test

**Files:**
- Create: `src/components/TableLayout/ANALYTICS_GAPS.md`
- Test: extend `__tests__/TableLayoutColumnEngine.test.tsx`

- [ ] **Step 1: Write `ANALYTICS_GAPS.md`**

```markdown
# TableLayout — Analytics Readiness Gaps

Single source of truth for `TableLayout`'s analytics-readiness, per `docs/metrics/contract.md`.

## Model

`TableLayout` is a markup-driven, composable table. The consumer writes the cells, so the
dominant seam is **consumer-owned content**: any interactive element placed inside
`TableLayoutCell` / `TableLayoutHeaderCell` carries its own `data-analytics-*` and is
captured directly. The DS primitives spread `{...props}` onto their native nodes, so
consumer `data-*` always reach the real element.

## Layout / display targets (exempt)

`TableLayout`, `TableLayoutHead`, `TableLayoutBody`, `TableLayoutRow`,
`TableLayoutHeaderCell`, `TableLayoutCell`, `TableLayoutColumnGroup`, `TableLayoutColumn`
— containers/display targets with no intrinsic click action. Exempt per the decision tree.
Pinning is pure sticky styling — no interactive target.

## Closed / drag targets (callback workaround)

- **CG-1 — Column resize (`TableLayoutResizeHandle`).** Pointer-drag with no DOM click,
  so a `data-analytics-id` on the handle would never resolve via the SDK click walk-up.
  **Seam:** the `onColumnSizingChange` option of `useTableLayoutColumns` — the consumer
  records the resize there. The handle still forwards `{...rest}` (consumer `data-*` are
  not dropped), but the callback is the canonical analytics path. Mirrors the existing
  `Table` CG-1.

## Derive-from-callback

- **Column visibility** — `onColumnVisibilityChange` option of `useTableLayoutColumns`.
- **Column pinning** — declared on the column def or via `onColumnPinningChange`.

## Open

None for Layer 2. Sort/selection/expand seams arrive with their layers (each as an
exported sub-component carrying `{...rest}`) and will be listed here as they land.
```

- [ ] **Step 2: Add the resize pass-through test.** Declare a `ResizeProbe` fixture (a resizable single-column table with a no-op `onColumnSizingChange`) and assert the handle exposes its `data-slot` pass-through hook. The handle's true analytics seam is `onColumnSizingChange` (proven in Task 5); this asserts the structural hook the SDK/consumer keys off, per `docs/metrics/testing-examples.md` (wrapper-level shape).

```tsx
describe('TableLayout column engine — metrics readiness', () => {
  const ResizeProbe = () => {
    const { columns, controller } = useTableLayoutColumns(
      [{ columnId: 'a', width: 120, resizable: true }],
      { onColumnSizingChange: () => {} },
    );
    return (
      <TableLayout aria-label='Metrics' controller={controller}>
        <TableLayoutColumnGroup>
          {columns.map(c => <TableLayoutColumn key={c.columnId} {...c} />)}
        </TableLayoutColumnGroup>
        <TableLayoutHead>
          <TableLayoutRow>
            <TableLayoutHeaderCell columnId='a'>A</TableLayoutHeaderCell>
          </TableLayoutRow>
        </TableLayoutHead>
        <TableLayoutBody>
          <TableLayoutRow rowId='r1'>
            <TableLayoutCell columnId='a'>x</TableLayoutCell>
          </TableLayoutRow>
        </TableLayoutBody>
      </TableLayout>
    );
  };

  it('renders the resize handle with a data-slot pass-through hook', () => {
    const { container } = render(<ResizeProbe />);
    const handle = container.querySelector('[data-slot="resize-handle"]');
    expect(handle).not.toBeNull();
    expect(handle).toHaveAttribute('data-slot', 'resize-handle');
  });
});
```

- [ ] **Step 3: Run, lint, typecheck, commit**

Run: `pnpm exec vitest run src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx` → PASS.
Run: `pnpm lint && pnpm typecheck` → PASS.
```bash
git add src/components/TableLayout/ANALYTICS_GAPS.md src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx
git commit -m "docs(table-layout): analytics gaps doc and resize pass-through test"
```

---

### Task 8: Public exports + Layer-2 integration test

**Files:**
- Modify: `src/components/TableLayout/index.ts`
- Test: extend `__tests__/TableLayoutColumnEngine.test.tsx`

- [ ] **Step 1: Update the barrel** — add to `index.ts`:

```ts
export {
  TableLayoutResizeHandle,
  type TableLayoutResizeHandleProps,
} from './primitives/TableLayoutResizeHandle';
export {
  useTableLayoutColumns,
  type UseTableLayoutColumnsOptions,
} from './useTableLayoutColumns';
export type {
  TableLayoutColumnController,
  TableLayoutColumnDef,
  TableLayoutColumnPinningState,
  TableLayoutColumnRenderProps,
  TableLayoutColumnResizeMode,
  TableLayoutColumnResolved,
  TableLayoutColumnSizingState,
  TableLayoutColumnVisibilityState,
} from './types';
```

> `TableLayout` already exports `TableLayoutProps`; it now includes `controller`. `TableLayoutHeaderCellProps` is newly public — add `export { TableLayoutHeaderCell, type TableLayoutHeaderCellProps }` to the existing header-cell export line.

- [ ] **Step 2: Add the combined integration test**

```tsx
describe('TableLayout column engine — combined', () => {
  const Combined = () => {
    const { columns, controller } = useTableLayoutColumns(
      [
        { columnId: 'pin', width: 100, pin: 'left', resizable: true },
        { columnId: 'mid', width: 100 },
        { columnId: 'tail', width: 100 },
      ],
      { columnVisibility: { mid: false } },
    );
    return (
      <TableLayout aria-label='Combined' controller={controller}>
        <TableLayoutColumnGroup>
          {columns.map(c => <TableLayoutColumn key={c.columnId} {...c} />)}
        </TableLayoutColumnGroup>
        <TableLayoutHead>
          <TableLayoutRow>
            <TableLayoutHeaderCell columnId='pin'>Pin</TableLayoutHeaderCell>
            <TableLayoutHeaderCell columnId='mid'>Mid</TableLayoutHeaderCell>
            <TableLayoutHeaderCell columnId='tail'>Tail</TableLayoutHeaderCell>
          </TableLayoutRow>
        </TableLayoutHead>
        <TableLayoutBody>
          <TableLayoutRow rowId='r1'>
            <TableLayoutCell columnId='pin'>p</TableLayoutCell>
            <TableLayoutCell columnId='mid'>m</TableLayoutCell>
            <TableLayoutCell columnId='tail'>t</TableLayoutCell>
          </TableLayoutRow>
        </TableLayoutBody>
      </TableLayout>
    );
  };

  it('pins, hides, and shows a resize handle coherently together', () => {
    const { container } = render(<Combined />);
    expect(screen.getByRole('cell', { name: 'p' })).toHaveStyle({ position: 'sticky', left: '0px' });
    expect(screen.queryByRole('cell', { name: 'm' })).toBeNull();
    expect(container.querySelectorAll('colgroup > col')).toHaveLength(2);
    expect(document.querySelector('[data-slot="resize-handle"]')).not.toBeNull();
  });
});
```

- [ ] **Step 3: Run the full component suite + lint + typecheck**

Run: `pnpm exec vitest run src/components/TableLayout` → all pass (Layer 1 + Layer 2 suites).
Run: `pnpm lint && pnpm typecheck` → PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/TableLayout/index.ts src/components/TableLayout/__tests__/TableLayoutColumnEngine.test.tsx
git commit -m "feat(table-layout): export column engine API and combined integration test"
```

---

## Self-Review

**Spec coverage (§6 rows 5/6/10, §10.2):**
- Resize (row 5) → Tasks 2/5 (controller `setColumnSize` + handle + `columnResizeMode`). ✅
- Pinning (row 6) → Tasks 1/4 (offset math + sticky styles). ✅
- Visibility (row 10) → Tasks 1/6 (self-hide) + hook `columnVisibility`/`onColumnVisibilityChange`. ✅
- Controller-hook is THE engine; declarative `<TableLayoutColumn>` remains the render form; hand-written path keeps Layer-1 align via self-registration (§10.2 revised). ✅
- Engine-managed self-hide (user decision) → Task 6. ✅
- `controller` on the **root** (sibling reachability) — Task 3. ✅
- Metrics-ready (user requirement) → Task 7; resize as CG-1; no analytics props. ✅

**Placeholder scan:** None. Task 7 Step 2 ships a concrete `ResizeProbe` fixture + assertion (the earlier placeholder draft was removed). All steps carry complete code and commands.

**Type consistency:** `TableLayoutColumnResolved` identical across `types.ts`, `computeColumnLayout`, context, cells, hook, controller. `setColumnSize(columnId, width)` identical in hook/controller/context/handle. `controller: TableLayoutColumnController` identical on the hook return and `TableLayoutProps`. Registry value migrated to `TableLayoutColumnResolved` with a back-compat alias.

**Re-render safety:** `TableLayoutColumn`'s registration effect is keyed on primitive props only (the resolved object is rebuilt inside the effect) — no identity-churn loop. The hook's `resolved`/`controller` are `useMemo`'d; root `getColumn` reads `controller.resolved` first, registry second.

**jsdom risk:** pin/resize tests assert inline `style`/callbacks, not geometry; `PointerEvent` shim included in Task 5.
