---
title: Filtering
description: Use when narrowing a list or table by attributes, or picking values from a long list — filter chips, hierarchical scope, query builder, searchable select, picker dialog.
components: [FilterDropdown, FilterDropdownTrigger, FilterDropdownContent, FilterDropdownOption, FilterCascade, FilterCascadeTrigger, FilterCascadeContent, FilterCascadeCheckboxItem, FilterInput, SearchInput, PageToolbar, Select, SelectInput, SelectSearchInput, SegmentedTabs, SegmentedControl, NumericBadge, Table, TableEmptyState, EmptyState, Dialog, Field, Button]
keywords: [filter, filters, filter bar, filter chip, filter pill, facet, facets, toolbar, scope filter, hierarchy, cascade, query builder, search, searchable select, combobox, autocomplete, select search, picker, picker dialog, add users, multi select, view toggle]
order: 90
---

# Filtering

Pick the control by the shape of the values; every filter applies on pick.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Text match on name or ID | `SearchInput` in `PageToolbar` | `Input` with a search icon |
| One status with counts | `SegmentedTabs` + `NumericBadge` | `FilterDropdown` |
| One flat attribute, one value | `FilterDropdown` with `allLabel` | `Select` in a toolbar |
| One flat attribute, several values | `FilterDropdown multiple` | `Checkbox` rows |
| A hierarchy (organization › deployment › application) | `FilterCascade` | Nested `DropdownMenu`s |
| Over four attributes, operators, AND/OR | `FilterInput` | Five `FilterDropdown`s |
| A value in a form | `Select` + `SelectInput` in `Field` | `FilterDropdown` |
| Pick rows from a large set | `Dialog width={960}` + selectable `Table` | A huge multi `Select` |
| Table or schema view | `SegmentedControl` with icons | `Tabs` |

There is no `FilterBar`, `PageFilters` or `Combobox` (use `Select` + `useSelectSearch`), and no `onApply` prop.

## Rules

**Filter bar layout**

- `PageToolbar` owns the 24px gutter and 12px gap. **Never** add `gap-*`, `px-*` or `py-*` to it.
- Wrap `SearchInput` and the filters in one `<div className='flex items-center gap-8'>`.
- `SearchInput` is `w-[320px]` in a toolbar, `flex-1` in a dialog.
- A view toggle goes last with `className='ml-auto'`.
- **Never** set a width on filter triggers; they hug their text up to 180px.
- **Never** stack two `SegmentedTabs` in one toolbar.

**FilterDropdown**

- Always give it a `label`; it names the trigger and aria-label.
- If the attribute is exclusive, use `allLabel` («All …» resets). If values combine, use `multiple` (OR-ed).
- Build `collection` with `createListCollection({ items, groupBy })`.
- Render options from `useFilterDropdown().groups` in a child component so they follow the search.
- `details.value` of `[]` means unset. Pass counts as `hint`.
- **Never** put `FilterDropdown` in a form or add an Apply button to a filter menu.

**FilterCascade**

- Import all cascade parts from `@wallarm-org/design-system/FilterCascade`, never the root.
- Build `collection` with `createFilterCascadeCollection(items, accessors)`; plain `{ value, label, children }` items need no accessors.
- If a level loads on demand, pass `loadChildren` and mark parents `hasChildren`. If a parent is pickable, pass `parentLabel`.
- If the menu needs a toggle ("Own only"), use `FilterCascadeCheckboxItem` in `FilterCascadeSection`; you keep its state.
- **Never** leave a description empty; show "No policies" for zero.

**FilterInput**

- Pass `fields` (`name`, `label`, `type`, `values`) and `value` / `onChange(ExprNode | null)`. Its menus and chips are built in.

**Searchable select**

- Put `SelectSearchInput` in `SelectHeader`, wired to `useSelectSearch`. Pass `filteredCollection` to `Select` and render it, so arrow keys skip hidden options.
- If the menu must match the trigger, pass `positioning={{ sameWidth: true }}` and `SelectPositioner className='min-w-full max-w-full'`; otherwise it is 240–320px.
- Option icons: set `icon` on each item.
- For several values use `SelectInput multiple`. `SelectButtonTag` is a trigger, not a chip list.

**Picker dialog**

- Use `Dialog width={960}`; there is no `DIALOG_SIZES`.
- Dialog parts own the 24px gutter. **Never** pad them. `DialogBody` has no `className`: put `flex flex-col gap-8` on a child div, search and tabs in `flex items-center gap-12`.
- Pass `getRowId` so selection survives search and paging.
- Primary is `disabled` "Add users" until rows are picked, then "Add 1 user", "Add 3 users".

## Examples

A filter bar over a table: search, a multiple and a single filter, a scope chip, and the view toggle last.

```story
Default
```

From eight options a filter menu gets a search, and its options follow the query.

```story
SearchableFilter
```

A scope chip whose applications load on demand and whose deployments can be picked.

```story
ScopeFilter
```

A searchable select in a form, with the menu matching the trigger.

```story
SearchableSelect
```

A picker dialog whose primary counts the selection: disabled "Add users", then "Add 2 users".

```story
PickerDialog
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Unset | Single: `allLabel`; multi: `label` | `FilterDropdownTrigger` |
| One value / several | "Type • Lua" / "Type • 2", built in; never custom text or a tag per value | `FilterDropdownTrigger` |
| Reset one filter | Multi: ✕ or Backspace; single: «All». No per-filter Reset button | `FilterDropdown` |
| Reset scope | ✕ returns to the page default, not one level up | `FilterCascadeTrigger` |
| 8+ options | Search appears (`searchThreshold`) | `FilterDropdownSearch`, `SelectSearchInput` |
| Menu search, no match | Empty message; menu stays open | `FilterDropdownEmpty`, `SelectEmptyState` |
| Cascade level loading or failed | Built-in loading rows, then Retry | `FilterCascade` |
| Filters match no rows | `type='collection-empty'` + outline neutral "Reset filters"; never a create CTA | `TableEmptyState` |
| Default value | Pinned first in a "Suggested" group | `SelectGroup` |
| Select on settings page | Saves on pick, toast; no Save button | `Select`, `Toast` |
| Picker running | Primary `loading`, dialog open; on success close and toast "3 users added" | `Button`, `Dialog` |
| Picker, no match | `EmptyState type='collection-empty'` as a direct `Table` child; `TableEmptyState` is too tall | `EmptyState` |
| Picker, already a member | Leave the row out of `data` | `Table` |

## What your app owns

| You own | The DS owns |
| --- | --- |
| Applying `details.value` to your data | Filter values and trigger text |
| URL sync (no router integration) | Nothing |
| "Reset all": every filter `[]`, search `''` | Per-filter clear |
| Option counts (`hint`, `getDescription`); a pinned option goes first in its own `category` | Rendering them |
| Scope dots: `size-6 rounded-full` span, `bg-badge-violet-strong` / `-sky-strong` / `-teal-strong`, via `getIcon` | The icon slot |
| Server search: debounce `query`, refetch `data` | Client filtering only |
| Picker selection across pages: keep `rowSelection` keys (row ids) when `data` changes | Checkbox column |
| Picker user cell (name, muted email): see [Entity table](./entity-table.md) | Nothing |

## Related

- [Resource list page](./resource-list-page.md), [Entity table](./entity-table.md), [Empty states](./empty-states.md)
- [Feedback toasts](./feedback-toasts.md), [Settings page](./settings-page.md), [Create and edit forms](./create-edit-forms.md)
- [Spacing](../foundations/spacing.md)
