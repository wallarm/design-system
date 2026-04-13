# Decouple Preview Drawer from Table Component

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the Drawer from the DS Table, leaving only: master column click (fires `onMasterCellClick`) and active row highlighting (`activeRowId`). The Drawer is rendered on the consumer (app) side.

**Architecture:** The current `TablePreviewDrawer` is an internal Table component that automatically renders a Drawer from DS. Replace with a callback-based API: Table accepts `onMasterCellClick(rowId)` and `activeRowId` as flat props instead of `preview.renderHeader/renderContent`. All toggle logic (open/close) and Drawer rendering move to the consumer side.

**Tech Stack:** React 19, TypeScript, TanStack Table, CVA/Tailwind, Vitest

---

## File Structure

### Design System (DS) — modified files

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/design-system/src/components/Table/types.ts` | **Modify** | Add flat `onMasterCellClick` + `activeRowId` props to `TableProps`, remove `TablePreview<T>` |
| `packages/design-system/src/components/Table/TableContext/types.ts` | **Modify** | Replace `preview` with flat `onMasterCellClick` + `activeRowId` in `TableContextValue` |
| `packages/design-system/src/components/Table/TableContext/TableProvider.tsx` | **Modify** | Remove `renderHeader/renderContent`, keep `activeRowId` + `onMasterCellClick` |
| `packages/design-system/src/components/Table/hooks/usePreviewCell.ts` | **Rename → useMasterCell.ts** | Simplify: call `onMasterCellClick` instead of toggle preview |
| `packages/design-system/src/components/Table/TableBody/TableBodyCell.tsx` | **Modify** | Adapt to new hook |
| `packages/design-system/src/components/Table/TableRow.tsx` | **Modify** | `preview.rowId` → `activeRowId` |
| `packages/design-system/src/components/Table/Table.tsx` | **Modify** | Remove `<TablePreviewDrawer />` |
| `packages/design-system/src/components/Table/TablePreviewDrawer.tsx` | **Delete** | No longer needed |
| `packages/design-system/src/components/Table/TablePreviewToggle.tsx` | **Delete** | Button trigger mode removed |
| `packages/design-system/src/components/Table/index.ts` | **Modify** | Remove `TablePreview` and `TablePreviewToggle` exports |
| `packages/design-system/src/components/Table/Table.stories.tsx` | **Modify** | Update stories: render Drawer outside Table |

### App (my) — modified files

| File | Action | Responsibility |
|------|--------|----------------|
| `src/pages/attacks-new/ui/attacks-table/index.tsx` | **Modify** | Drawer rendered here, using `onMasterCellClick` + `activeRowId` |

---

## New Public API (replaces `TablePreview<T>`)

Two flat props on `TableProps`:

```typescript
/** Callback fired when the master cell is clicked. Receives the row ID. */
onMasterCellClick?: (rowId: string) => void
/** ID of the currently active (highlighted) row, or null. Controls row highlighting via data-preview-active attribute. */
activeRowId?: string | null
```

Tooltip text is hardcoded as `'Open details'` internally.

**Key change:** `onMasterCellClick` is always called with `rowId` — the app decides whether to open/close/toggle the drawer. DS knows nothing about the drawer.

---

## Tasks

### Task 1: Update public types (`types.ts`)

**Files:**
- Modify: `packages/design-system/src/components/Table/types.ts:224-239`

- [x] **Step 1: Remove `TablePreview<T>` and add flat props**

In `packages/design-system/src/components/Table/types.ts`, remove:

```typescript
/** Preview drawer configuration */
export interface TablePreview<T> {
  renderHeader?: (row: TableRow<T>) => ReactNode;
  renderContent: (row: TableRow<T>) => ReactNode;
  trigger?: 'master' | 'button';
  tooltipText?: string;
  rowId?: string | null;
  onRowChange?: (rowId: string | null) => void;
}
```

And replace the `preview` prop in `TableProps<T>` with:

```typescript
  // --- Master cell click ---
  /** Callback fired when the master cell is clicked. Receives the row ID. */
  onMasterCellClick?: (rowId: string) => void;
  /** ID of the currently active (highlighted) row, or null. */
  activeRowId?: string | null;
```

- [x] **Step 2: Remove `renderPreviewAction` from `ColumnMeta`**

Remove from both the TanStack `ColumnMeta` augmentation and the `TableColumnMeta<T>` type:

```typescript
    renderPreviewAction?: (row: Row<TData>) => ReactNode;
```

- [x] **Step 3: Commit**

```bash
git add packages/design-system/src/components/Table/types.ts
git commit -m "refactor(table): replace TablePreview with flat onMasterCellClick + activeRowId props"
```

---

### Task 2: Update Table context types

**Files:**
- Modify: `packages/design-system/src/components/Table/TableContext/types.ts:57-64`

- [x] **Step 1: Replace `preview` in `TableContextValue`**

Replace:

```typescript
  preview: {
    rowId: string | null;
    setRowId: (id: string | null) => void;
    renderHeader?: (row: Row<T>) => ReactNode;
    renderContent?: (row: Row<T>) => ReactNode;
    trigger: 'master' | 'button';
    tooltipText: string;
  };
```

With flat fields:

```typescript
  // Master cell click
  onMasterCellClick?: (rowId: string) => void;
  activeRowId: string | null;
```

- [x] **Step 2: Commit**

```bash
git add packages/design-system/src/components/Table/TableContext/types.ts
git commit -m "refactor(table): flatten context - onMasterCellClick + activeRowId as top-level fields"
```

---

### Task 3: Update `TableProvider`

**Files:**
- Modify: `packages/design-system/src/components/Table/TableContext/TableProvider.tsx`

- [x] **Step 1: Simplify props destructuring**

In `TableProvider` (lines 83-91) replace:

```typescript
    preview,
  } = props;

  const renderPreviewHeader = preview?.renderHeader;
  const renderPreviewContent = preview?.renderContent;
  const previewTrigger = preview?.trigger ?? 'master';
  const previewTooltipText = preview?.tooltipText ?? 'Open preview';
  const previewRowIdProp = preview?.rowId;
  const onPreviewRowChange = preview?.onRowChange;
```

With:

```typescript
    onMasterCellClick,
    activeRowId: activeRowIdProp,
  } = props;

  const masterCellActiveRowId = activeRowIdProp ?? null;
```

- [x] **Step 2: Remove preview drawer state (controlled/uncontrolled)**

Delete the `useControlled` block for preview row ID and `setPreviewRowId` callback.

- [x] **Step 3: Update `contextValue`**

Replace the `preview` object with flat fields:

```typescript
      onMasterCellClick,
      activeRowId: masterCellActiveRowId,
```

- [x] **Step 4: Update `useMemo` dependency array**

Remove `previewRowId, setPreviewRowId, renderPreviewHeader, renderPreviewContent, previewTrigger, previewTooltipText` and add `masterCellActiveRowId, onMasterCellClick`.

- [x] **Step 5: Check `useControlled` import**

`useControlled` is also used for `columnPinning` (line 207), so the import stays.

- [x] **Step 6: Commit**

```bash
git add packages/design-system/src/components/Table/TableContext/TableProvider.tsx
git commit -m "refactor(table): simplify TableProvider - remove preview drawer state"
```

---

### Task 4: Rename and rewrite `usePreviewCell` → `useMasterCell`

**Files:**
- Rename: `packages/design-system/src/components/Table/hooks/usePreviewCell.ts` → `useMasterCell.ts`

- [x] **Step 1: Rewrite the hook**

Create `useMasterCell.ts` with:

```typescript
import { useCallback } from 'react';
import { useTableContext } from '../TableContext';

/**
 * Encapsulates master cell click logic for a body cell.
 * Returns flags and a click handler for the master column.
 */
export const useMasterCell = <T>(columnId: string, rowId: string) => {
  const { masterColumnId, onMasterCellClick } = useTableContext<T>();

  const isMasterColumn = columnId === masterColumnId;
  const hasMasterClick = isMasterColumn && !!onMasterCellClick;

  const handleClick = useCallback(() => {
    onMasterCellClick?.(rowId);
  }, [onMasterCellClick, rowId]);

  return {
    /** Master cell click is enabled */
    isMasterTrigger: hasMasterClick,
    /** Fire master cell click for this row */
    handleClick,
    /** Tooltip text for master cell hover */
    tooltipText: hasMasterClick ? 'Open details' : undefined,
  };
};
```

- [x] **Step 2: Update barrel export in `hooks/index.ts`**

- [x] **Step 3: Commit**

```bash
git add packages/design-system/src/components/Table/hooks/
git commit -m "refactor(table): rename usePreviewCell to useMasterCell with simplified API"
```

---

### Task 5: Update `TableBodyCell`

**Files:**
- Modify: `packages/design-system/src/components/Table/TableBody/TableBodyCell.tsx`

- [x] **Step 1: Remove `isButtonTrigger` from destructuring**

Update to use `useMasterCell` with new return names (`handleClick` instead of `togglePreview`).

- [x] **Step 2: Simplify `hasActions`**

Change from `isButtonTrigger || !!meta?.renderPreviewAction || !!meta?.renderMenuAction` to just `!!meta?.renderMenuAction`.

- [x] **Step 3: Remove `TablePreviewToggle` from render**

Remove `isButtonTrigger && <TablePreviewToggle ...>` and `meta?.renderPreviewAction?.(cell.row)` from the actions block.

- [x] **Step 4: Remove unused imports**

Remove `TablePreviewToggle` import.

- [x] **Step 5: Commit**

```bash
git add packages/design-system/src/components/Table/TableBody/TableBodyCell.tsx
git commit -m "refactor(table): remove button trigger and preview toggle from TableBodyCell"
```

---

### Task 6: Update `TableRow`

**Files:**
- Modify: `packages/design-system/src/components/Table/TableRow.tsx`

- [x] **Step 1: Replace `preview` with flat context fields**

```typescript
// Before
const { expandingEnabled, preview } = useTableContext<T>();
const isPreviewActive = preview.rowId === row.id;

// After
const { expandingEnabled, activeRowId } = useTableContext<T>();
const isPreviewActive = activeRowId === row.id;
```

- [x] **Step 2: Commit**

```bash
git add packages/design-system/src/components/Table/TableRow.tsx
git commit -m "refactor(table): use activeRowId from context for row highlighting"
```

---

### Task 7: Delete `TablePreviewDrawer` and `TablePreviewToggle`, update `Table.tsx`

**Files:**
- Delete: `packages/design-system/src/components/Table/TablePreviewDrawer.tsx`
- Delete: `packages/design-system/src/components/Table/TablePreviewToggle.tsx`
- Modify: `packages/design-system/src/components/Table/Table.tsx`

- [x] **Step 1: Delete `TablePreviewDrawer.tsx` and `TablePreviewToggle.tsx`**

- [x] **Step 2: Remove `TablePreviewDrawer` from `Table.tsx`**

Remove import and `<TablePreviewDrawer />` from JSX.

- [x] **Step 3: Commit**

```bash
git rm packages/design-system/src/components/Table/TablePreviewDrawer.tsx
git rm packages/design-system/src/components/Table/TablePreviewToggle.tsx
git add packages/design-system/src/components/Table/Table.tsx
git commit -m "refactor(table): remove TablePreviewDrawer and TablePreviewToggle"
```

---

### Task 8: Update exports (`index.ts`)

**Files:**
- Modify: `packages/design-system/src/components/Table/index.ts`

- [x] **Step 1: Remove `TablePreview` and `TablePreviewToggle` from exports**

Remove:
```typescript
export { TablePreviewToggle, type TablePreviewToggleProps } from './TablePreviewToggle';
```

Remove `TablePreview` from type exports (no replacement type needed — props are flat on `TableProps`).

- [x] **Step 2: Commit**

```bash
git add packages/design-system/src/components/Table/index.ts
git commit -m "refactor(table): clean up Table exports"
```

---

### Task 9: Update stories

**Files:**
- Modify: `packages/design-system/src/components/Table/Table.stories.tsx`

- [x] **Step 1: Update `MasterCellWithActions` story**

Remove the `preview` prop entirely. The story demonstrates `renderMenuAction` on the master column — it works without preview/drawer integration.

- [x] **Step 2: Rename and rewrite `MasterCellWithPreviewDrawer` → `MasterCellWithDrawer`**

Convert to use `onMasterCellClick` + `activeRowId` props on Table, with an external `<Drawer>` rendered alongside.

```tsx
export const MasterCellWithDrawer: StoryFn<typeof meta> = () => {
  const [sorting, setSorting] = useState<TableSortingState>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  // ... data and columns setup ...

  const handleMasterCellClick = useCallback((rowId: string) => {
    setActiveRowId(prev => (prev === rowId ? null : rowId));
  }, []);

  const activeRow = useMemo(
    () => data.find(d => d.id === activeRowId),
    [data, activeRowId],
  );

  return (
    <>
      <Table
        data={data}
        columns={columns}
        getRowId={row => row.id}
        sorting={sorting}
        onSortingChange={setSorting}
        onMasterCellClick={handleMasterCellClick}
        activeRowId={activeRowId}
      />
      <Drawer
        open={!!activeRow}
        onOpenChange={open => { if (!open) setActiveRowId(null); }}
        modal={false}
        overlay={false}
        closeOnOutsideClick={false}
        width={960}
      >
        <DrawerContent>
          {activeRow ? renderSecurityPreviewHeader({ original: activeRow }) : <DrawerHeader><span /></DrawerHeader>}
          <DrawerBody>
            {activeRow && renderSecurityPreviewContent({ original: activeRow })}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
```

- [x] **Step 3: Remove `ButtonTriggerPreviewDrawer` story**

This trigger mode is no longer supported.

- [x] **Step 4: Commit**

```bash
git add packages/design-system/src/components/Table/Table.stories.tsx
git commit -m "refactor(table): update Table stories to use onMasterCellClick + external Drawer"
```

---

### Task 10: Typecheck and lint

- [x] **Step 1: Run typecheck**

```bash
pnpm typecheck
```

Expected: PASS (0 errors).

- [x] **Step 2: Run lint and format**

```bash
npx biome check --write packages/design-system/src/components/Table/
```

- [x] **Step 3: Commit if there are changes**

```bash
git add -A
git commit -m "style(table): fix lint and formatting after preview refactor"
```

---

### Task 11: Update app-side (`attacks-table/index.tsx`)

**Files:**
- Modify: `/Users/klimovaoks/Projects/work/my/src/pages/attacks-new/ui/attacks-table/index.tsx`

> This task runs in a different repository (`my`), after publishing the new DS version.

- [x] **Step 1: Replace `preview` with flat props + external Drawer**

Replace:

```tsx
<Table
    ...
    preview={{
        renderHeader: renderPreviewHeader,
        renderContent: renderPreviewContent,
        tooltipText: 'Open attack details',
        rowId: previewRowId,
        onRowChange: onPreviewRowChange,
    }}
>
    {hasEverLoaded && <AttacksTableEmpty />}
</Table>
```

With:

```tsx
<>
    <Table
        ...
        onMasterCellClick={handleMasterCellClick}
        activeRowId={previewRowId}
    >
        {hasEverLoaded && <AttacksTableEmpty />}
    </Table>
    <Drawer
        open={!!activeRow}
        onOpenChange={open => { if (!open) onPreviewRowChange?.(null); }}
        modal={false}
        overlay={false}
        closeOnOutsideClick={false}
        width={960}
    >
        <DrawerContent>
            {displayRow && (
                <AttackPreviewDrawerHeader
                    attack={displayRow}
                    activeTab={previewTab}
                    onTabChange={setPreviewTab}
                />
            )}
            <DrawerBody>
                {displayRow && (
                    <AttackPreviewContent
                        attack={displayRow}
                        viewConfig={viewConfig}
                        activeTab={previewTab}
                    />
                )}
            </DrawerBody>
        </DrawerContent>
    </Drawer>
</>
```

- [x] **Step 2: Add `handleMasterCellClick`**

```typescript
const handleMasterCellClick = useCallback(
  (rowId: string) => {
    onPreviewRowChange?.(previewRowId === rowId ? null : rowId);
  },
  [previewRowId, onPreviewRowChange],
);
```

- [x] **Step 3: Add `activeRow` memo + ref caching for close animation**

```typescript
const activeRow = useMemo(
  () => (previewRowId ? data.find(d => d.id === previewRowId) : undefined),
  [previewRowId, data],
);

// Keep last valid row so drawer content doesn't flash empty during close animation
const lastActiveRowRef = useRef<AttackVectorRow | undefined>(undefined);
if (activeRow) lastActiveRowRef.current = activeRow;
const displayRow = activeRow ?? lastActiveRowRef.current;
```

- [x] **Step 4: Add Drawer imports**

```typescript
import { Drawer, DrawerBody, DrawerContent } from '@wallarm-org/design-system/Drawer';
```

- [x] **Step 5: Commit**

```bash
git add src/pages/attacks-new/ui/attacks-table/index.tsx
git commit -m "refactor(attacks-table): use onMasterCellClick + activeRowId + render Drawer externally"
```

---

## Summary of Breaking Changes

| Before (DS) | After (DS) |
|---|---|
| `TablePreview<T>` type | Removed — flat props on `TableProps` |
| `preview` prop on `<Table>` | `onMasterCellClick` + `activeRowId` flat props |
| `preview.renderHeader` / `preview.renderContent` | Removed — consumer renders Drawer |
| `preview.trigger: 'master' \| 'button'` | Removed — always master click |
| `preview.rowId` / `preview.onRowChange` | `activeRowId` / `onMasterCellClick(rowId)` |
| `preview.tooltipText` | Removed — hardcoded as `'Open details'` |
| `TablePreviewDrawer` (internal) | Deleted |
| `TablePreviewToggle` (exported) | Deleted |
| `ColumnMeta.renderPreviewAction` | Removed |
