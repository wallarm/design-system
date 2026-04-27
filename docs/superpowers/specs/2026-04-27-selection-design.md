# Selection Component Design

**Status:** Approved (pending user spec review)
**Date:** 2026-04-27
**Ticket:** AS-884

## Goal

Extract row-selection + bulk-action-bar pattern from `Table` into a generic, reusable compound component family that can wrap arbitrary elements (cards, custom layouts) and provide:

- Per-item checkbox tied to a shared selection state
- Standalone "select-all" checkbox placeable anywhere
- Animated popup bulk-action bar with action slots, count, "Select all" and "Clear" controls

`Table` is **not** modified in v1 — keeps its existing built-in selection. Migration is a future follow-up.

## Non-Goals (v1)

- Uncontrolled mode (`defaultValue`)
- Virtualized item lists
- Public `SelectionCheckbox` primitive (kept internal)
- Viewport-bottom bulkbar positioning
- Migrating `Table` to use this abstraction

## Decisions Recap

| Question | Choice |
|---|---|
| Scope | Independent component; Table untouched |
| Identity model | Pure id-based (`string[]` state + id callbacks) |
| API shape | Compound (`<Selection>`, `<SelectionItem>`, `<SelectionAll>`, `<SelectionBulkBar>`) |
| Bulkbar anchor | Anchored to `<Selection>` root (no viewport-bottom mode) |
| Item interaction | Checkbox always visible; click on checkbox toggles; click on card = card's own behavior |
| Extras | Disabled items + shift-click range selection included |

## Architecture

A compound component family at `packages/design-system/src/components/Selection/` mirroring the patterns of `Table` + `TableActionBar` but decoupled from TanStack Table. Reuses existing `Checkbox`, `CheckboxIndicator` and ark-ui Popover/Portal primitives. State is held in `<Selection>` and exposed via React context to all sub-components.

## Public API

```tsx
import {
  Selection,
  SelectionItem,
  SelectionAll,
  SelectionBulkBar,
} from '@wallarm/design-system';

const [selectedIds, setSelectedIds] = useState<string[]>([]);

<Selection
  items={items}
  getItemId={item => item.id}
  value={selectedIds}
  onChange={setSelectedIds}
>
  <Toolbar>
    <SelectionAll />
  </Toolbar>

  <Grid>
    {items.map(item => (
      <SelectionItem key={item.id} itemId={item.id} disabled={item.locked}>
        <Card>...</Card>
      </SelectionItem>
    ))}
  </Grid>

  <SelectionBulkBar>
    <Button onClick={() => bulkDelete(selectedIds)}>Delete</Button>
    <Button onClick={() => bulkArchive(selectedIds)}>Archive</Button>
  </SelectionBulkBar>
</Selection>
```

### Component contracts

| Component | Role | Props |
|---|---|---|
| `<Selection>` | Root provider, holds state, wraps children in Popover.Anchor for bulkbar. | `items: T[]`, `getItemId: (item: T) => string`, `value: string[]`, `onChange: (ids: string[]) => void`, `data-testid?: string`, `className?: string`, `children` |
| `<SelectionItem>` | Item wrapper. Renders inline checkbox + children in HStack. | `itemId: string`, `disabled?: boolean`, `className?: string`, `children` |
| `<SelectionAll>` | Standalone select-all checkbox. Supports indeterminate. | `data-testid?: string` |
| `<SelectionBulkBar>` | Animated popup with summary + action slots. Visible when `value.length > 0`. | `children`, `aria-label?: string` (default `"Bulk actions"`), `data-testid?: string` |

## State and Context

### Context shape

```ts
interface SelectionContextValue {
  itemIds: string[];                       // memoized items.map(getItemId)
  enabledItemIds: string[];                // ids where !disabled (from registry)

  selectedIds: Set<string>;                // derived from value prop via useMemo
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;                  // every enabledItemId in selectedIds
  isIndeterminate: boolean;                // some-but-not-all enabledItemIds selected

  toggleItem: (id: string, opts?: { shiftKey?: boolean }) => void;
  selectAll: () => void;
  clear: () => void;

  registerDisabled: (id: string, disabled: boolean) => void;
}
```

### Disabled registry

`<SelectionItem>` calls `registerDisabled(id, disabled)` in a `useEffect`, with cleanup unregistering on unmount or id change. The registry lives as a `Map<string, boolean>` in a ref in `<Selection>`. `enabledItemIds` is recomputed when registry changes (using a tick state to trigger re-render).

This is necessary because `disabled` lives at the item level but `<SelectionAll>` / range logic in root needs to know which ids are disabled.

### Mutator semantics

- **`toggleItem(id, { shiftKey })`:**
  - If `shiftKey === true` AND `lastToggledIdRef.current` exists AND `lastToggledIdRef.current !== id`:
    - Find indices of both ids in `itemIds`.
    - Iterate the inclusive range from `min` to `max`, skipping disabled ids.
    - Direction: if the clicked id is currently **un**selected → select all in range; if currently selected → deselect all in range.
  - Else: single toggle. Disabled id → no-op.
  - Always update `lastToggledIdRef.current = id` (even on no-op skip? **No** — only on successful toggle).
- **`selectAll()`:** `onChange(enabledItemIds)`. Keeps order from `itemIds`.
- **`clear()`:** `onChange([])`.

All mutators emit a new `string[]` in the order it appears in `itemIds` — predictable for consumers.

### Controlled-only

`value` is required. No internal state, no `defaultValue`. Simpler API; uncontrolled is a future addition.

## File Structure

```
packages/design-system/src/components/Selection/
  index.ts
  Selection.tsx                  — root: Provider + Popover.Root + Popover.Anchor wrap
  SelectionContext.ts            — Context definition + types
  useSelectionContext.ts         — internal hook (throws if used outside <Selection>)
  useSelectionState.ts           — pure state hook (extracted for unit tests)
  SelectionItem.tsx              — item wrapper + inline Checkbox
  SelectionAll.tsx               — standalone select-all checkbox
  SelectionBulkBar/
    index.ts
    SelectionBulkBar.tsx         — Portal + Popover.Content (the visible bar)
    SelectionBulkBarSummary.tsx  — count + Select all + Clear (mirrors TableActionBarSelection)
  classes.ts                     — CVA for SelectionItem layout
  Selection.stories.tsx
  Selection.e2e.ts
```

Each file owns one responsibility and is small enough to reason about in isolation. `useSelectionState` is extracted so logic can be unit-tested without DOM.

## Component Internals

### `<Selection>`

```tsx
export const Selection = <T,>({
  items,
  getItemId,
  value,
  onChange,
  className,
  'data-testid': testId,
  children,
}: SelectionProps<T>) => {
  const state = useSelectionState({ items, getItemId, value, onChange });

  return (
    <SelectionContext.Provider value={state}>
      <TestIdProvider value={testId}>
        <ArkUiPopover.Root
          open={value.length > 0}
          closeOnInteractOutside={false}
          portalled={false}
          positioning={SELECTION_BULKBAR_POSITIONING}
        >
          <ArkUiPopover.Anchor data-testid={testId} className={cn('relative outline-none', className)}>
            {children}
          </ArkUiPopover.Anchor>
        </ArkUiPopover.Root>
      </TestIdProvider>
    </SelectionContext.Provider>
  );
};
```

Positioning constants taken from `TableActionBarProvider` (gutter 32, mainAxis offset for bottom-anchored bar).

### `<SelectionItem>`

```tsx
<div
  data-slot='selection-item'
  data-selected={isSelected || undefined}
  className={cn(selectionItemVariants(), className)}
>
  <Checkbox
    checked={isSelected}
    disabled={disabled}
    onCheckedChange={(_, event) => {
      const shiftKey = (event?.nativeEvent as MouseEvent | undefined)?.shiftKey ?? false;
      toggleItem(itemId, { shiftKey });
    }}
  >
    <CheckboxIndicator />
  </Checkbox>
  {children}
</div>
```

Default layout via CVA: `flex items-start gap-12`. Override via `className`.

**Shift detection fallback:** if ark-ui's `onCheckedChange` does not pass the native event, fall back to `useIsKeyPressed('Shift')` (already used in `createSelectionColumn`). Decision made during implementation; both paths produce the same context call.

### `<SelectionAll>`

```tsx
<Checkbox
  data-testid={useTestId('all')}
  checked={isIndeterminate ? 'indeterminate' : isAllSelected}
  disabled={enabledItemIds.length === 0}
  onCheckedChange={() => (isAllSelected ? clear() : selectAll())}
>
  <CheckboxIndicator />
</Checkbox>
```

### `<SelectionBulkBar>`

```tsx
<ArkUiPortal>
  <ArkUiPopover.Positioner style={{ zIndex: 50 }}>
    <ArkUiPopover.Content
      role='toolbar'
      aria-label={ariaLabel ?? 'Bulk actions'}
      data-testid={useTestId('bulk-bar')}
      className={cn(
        'bg-component-toast-bg rounded-16 shadow-lg pl-12 pr-8 py-8',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom data-[state=open]:duration-300',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150',
      )}
    >
      <HStack gap={40} align='center'>
        <SelectionBulkBarSummary />
        <HStack gap={8} align='center'>{children}</HStack>
      </HStack>
    </ArkUiPopover.Content>
  </ArkUiPopover.Positioner>
</ArkUiPortal>
```

`SelectionBulkBarSummary` mirrors `TableActionBarSelection` — text "X selected", "Select all" link (disabled if all selected), separator dot, "Clear" link.

## Storybook Stories

File `Selection.stories.tsx`. Stories are self-contained.

| Story | Demonstrates |
|---|---|
| `Default` | Vertical list of `Card` items with checkboxes + bulkbar. |
| `WithSelectAll` | `Default` + `<SelectionAll>` placed in a toolbar above the list. |
| `Grid` | 3-column CSS grid of cards — proves layout is not dictated. |
| `WithDisabled` | Some items have `disabled`; verifies skip in select-all + range. |
| `RangeSelection` | Hint text + interactive shift-click range demo. |
| `BulkActions` | Multiple action buttons (Delete, Archive, Export) wired to callbacks using `selectedIds`. |
| `EmptyAndPartial` | `items=[]` (no bulkbar, all disabled) and stale-ids cleanup via `useEffect`. |
| `WithoutBulkBar` | Selection without `<SelectionBulkBar>` — user renders own action panel from `value`. |

`Default` uses `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`, `Badge`, `VStack`, `Button`, `Text` from the design system. Sample data is 3–5 mock cluster/host objects.

## Testing

### Unit tests (Vitest) — for `useSelectionState`

| Test | Assertion |
|---|---|
| toggle adds id when not selected | `value` becomes `[id]` |
| toggle removes id when selected | `value` becomes `[]` |
| toggle on disabled id | `onChange` not called |
| shift+click range selects unselected diapason | range from `lastToggledId` to clicked is added |
| shift+click range deselects when clicked is selected | range removed |
| shift+click range skips disabled ids | disabled ids absent from result |
| shift+click without prior `lastToggledId` | falls back to single toggle |
| `selectAll` returns enabled ids only | disabled excluded |
| `clear` returns `[]` | always |
| `isAllSelected` with empty items | `false` |
| `isAllSelected` with all items disabled | `false` (no enabled to select) |
| `isIndeterminate` partial | `true` |
| stale ids in `value` (not in items) | preserved in `value`, ignored by `isAllSelected`/`isIndeterminate` |
| selecting after item reorder | ids stable, output ordered by current `itemIds` |

### E2E tests (Playwright) — `Selection.e2e.ts`

Per `docs/e2e-test-rules.md`:

**Screenshots:**
- Default state (no selection)
- One item selected
- All items selected (bulkbar shows "Select all" disabled)
- Indeterminate state on `<SelectionAll>`
- Disabled item rendering
- Bulkbar appearing (open state) and dismissed (closed state)
- Grid layout

**Interactions:**
- Click checkbox toggles single item
- Shift+click selects range
- Shift+click on selected item deselects range
- `<SelectionAll>` selects all, clicking again clears
- "Clear" link in bulkbar empties selection
- "Select all" link in bulkbar fills selection
- Disabled item ignores click

**Accessibility:**
- `<Checkbox>` keyboard activation (Space) toggles
- Bulkbar has `role="toolbar"` + `aria-label`
- `<SelectionAll>` exposes `aria-checked="mixed"` when indeterminate

## Edge Cases

| Case | Behavior |
|---|---|
| `items=[]` | `<SelectionAll>` disabled. `<SelectionBulkBar>` hidden. No errors. |
| All items disabled | `<SelectionAll>` disabled. Range never engages. |
| `value` contains id not in `items` | Preserved in `value`. Ignored by `isAllSelected`/`isIndeterminate`. Cleanup is consumer's responsibility. Documented in JSDoc + `EmptyAndPartial` story. |
| Duplicate ids in `items` | Not validated. In dev-mode, `console.warn` on `itemIds` change if duplicates detected. |
| Reentrant `onChange` (parent delays state update) | UI does not block; `lastToggledIdRef` updates synchronously. |
| No `<SelectionBulkBar>` rendered | Selection works as pure state provider. |
| Multiple `<SelectionBulkBar>` | Technically possible — both render their `Popover.Content`. Not encouraged; one example only. |
| `<SelectionItem>` rendered outside `<Selection>` | `useSelectionContext` throws with a clear message. |
| Item id collisions across renders | Same as duplicates — dev warning. |

## Accessibility

- Checkboxes inherit `<Checkbox>` ARIA from DS.
- Bulkbar: `role="toolbar"`, `aria-label="Bulk actions"` (overridable), `closeOnInteractOutside={false}` so focus stays on user's elements.
- `<SelectionAll>` indeterminate state maps to `aria-checked="mixed"` (handled by `<Checkbox>`).

## Test ID Cascading

Per `.claude/rules/test-id.md`:

| Slot | Component |
|---|---|
| `selection` | `<Selection>` root |
| `all` | `<SelectionAll>` |
| `item` | `<SelectionItem>` (data-slot, not data-testid) |
| `bulk-bar` | `<SelectionBulkBar>` |
| `bulk-bar-summary` | `<SelectionBulkBarSummary>` |

`<Selection>` extracts `data-testid`, wraps in `<TestIdProvider>`. Sub-components use `useTestId('slot')`.

## Dependencies

All already used in the design system:

- `@ark-ui/react/popover` (TableActionBar)
- `@ark-ui/react/portal` (TableActionBar)
- `Checkbox`, `CheckboxIndicator` (DS internal)
- `useIsKeyPressed` (hooks/, fallback for shift detection)
- `class-variance-authority`, `cn` utility
- `HStack`, `VStack`, `Text`, `Link` (for summary and stories)

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Ark-ui Popover.Anchor wrapping changes layout flow of consumer's content | Use `display: contents`-friendly className or `relative outline-none` (same as TableActionBarAnchor). Verify in Grid story. |
| Disabled-registry causes re-render storms on item mount/unmount in big lists | Batch re-render via tick-state; document v1 as not virtualization-friendly. |
| `enabledItemIds` recompute on every registration tick | Acceptable for v1 (non-virtualized). Optimize if perf issue arises. |
| Shift-detection inconsistent across ark-ui versions | Fallback to `useIsKeyPressed('Shift')` exists. |

## Future Follow-ups (NOT in v1)

1. Migrate `Table` to use `Selection` internally
2. Uncontrolled mode with `defaultValue`
3. Public `<SelectionCheckbox itemId>` primitive for custom card layouts
4. `position="viewport-bottom"` for `<SelectionBulkBar>`
5. Range selection without shift (programmatic API on context)
6. Keyboard navigation between items (arrow keys)
