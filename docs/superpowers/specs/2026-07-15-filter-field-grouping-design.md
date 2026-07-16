# FilterInput Field Grouping (`fieldGroups`) Design Spec

**Date:** 2026-07-15
**Ticket:** AS-1283 (filter grouping)
**Branch:** `feat/AS-1283-filter-grouping`
**Figma:** `VKb5gW46uSGw0rqrhZsbXT` (WADS-Components), field-menu grouping (node `10290-78185`)

## Overview

Add an **optional** way to organize the FilterInput field-selection menu into
labeled groups — e.g. "Threat classification", "Request features", "Source and
identity" — instead of one flat list. Today `FilterInputFieldMenu` renders all
fields under a single `DropdownMenuGroup`. This spec adds a new optional
`fieldGroups` prop that, when provided, buckets fields under section headers.

**Non-breaking is a hard constraint.** The existing `fields` prop is untouched.
When `fieldGroups` is omitted, the menu renders exactly as it does today. The
feature is purely additive.

The visual treatment reuses the existing section-header pattern already used by
the Recent and Suggestions sections: `DropdownMenuLabel` for the header and
`DropdownMenuSeparator` between sections. No new visual primitives are needed.

## Data model

Grouping is expressed as a **separate prop** that references fields by `name`,
rather than a `group` field on each `FieldMetadata`. This keeps `FieldMetadata`
(which mirrors the backend field contract) unchanged and keeps group ordering
explicit and single-sourced.

New type in `types.ts`:

```ts
/** A labeled group of filter fields, referenced by field `name`. */
export interface FieldGroup {
  /** Section header text (e.g. "Threat classification"). */
  label: string;
  /** Field names in display order. Unknown names are ignored. */
  fields: string[];
}
```

New prop on `FilterInputProps` (threaded through `FilterInputMenuProps` →
`FilterInputFieldMenuProps`):

```ts
/**
 * Optional grouping for the field menu. When omitted, fields render as a flat
 * list (current behavior). Groups render in array order; fields within a group
 * in listed order; fields not referenced by any group fall into a trailing
 * headerless section. Unknown field names are ignored. A field listed in more
 * than one group resolves to its first group only.
 */
fieldGroups?: FieldGroup[];
```

`fieldGroups` references only field *names*, so it is unaffected by the
`applyKnownFieldHelpers(rawFields)` transform that `fields` passes through in
`FilterInput`.

## Behavior decisions

1. **No `fieldGroups`** → single headerless section = today's flat list.
   Guarantees non-breaking behavior for every current consumer.
2. **Group order** = `fieldGroups` array order.
3. **Field order within a group** = the order of names in that group's `fields`
   array.
4. **Ungrouped fields** (present in `fields`, not referenced by any group) →
   a **trailing headerless section**, in original `fields` order. Nothing is
   ever silently hidden even if backend grouping is incomplete.
5. **Search** (`filterText` present) → `filterAndSort` runs **within each
   section**; `startsWith` matches float to the top *inside* their section.
   **Sections whose filtered field list is empty are dropped**, headers and all
   — consistent with how Recent/Suggestions hide when empty.
6. **Duplicate field** across groups → resolved to its **first** group (dedup),
   so it is never rendered twice or double-registered for keyboard navigation.
7. **Unknown name** in a group's `fields` → skipped.
8. **Recent / Suggestions / AND-OR** sections are **unchanged** and continue to
   render on top (Recent/Suggestions) or bottom (AND-OR) exactly as today.
   Grouping only restructures the main field list between them.

## Architecture

### Pure helper — `lib/buildFieldMenuSections.ts`

The bucketing/ordering/filtering/empty-drop logic lives in a pure, unit-testable
function (mirrors the existing `lib/filterSort.ts` convention). The component
stays a thin renderer.

```ts
export interface FieldMenuSection {
  /** Header text; undefined = headerless section (flat list / ungrouped tail). */
  label?: string;
  fields: FieldMetadata[];
}

export function buildFieldMenuSections(
  fields: FieldMetadata[],
  fieldGroups: FieldGroup[] | undefined,
  filterText: string,
): FieldMenuSection[];
```

Algorithm:

- If `!fieldGroups` → `return [{ fields: filterAndSort(fields, filterText, getText) }]`.
- Else:
  1. Build a `Map<name, FieldMetadata>` from `fields`.
  2. Track a `claimed: Set<string>` of names already placed.
  3. For each group in order: resolve `group.fields` names to metadata (skip
     unknown, skip already-claimed), mark claimed, then
     `filterAndSort(groupFields, filterText, getText)`. Push
     `{ label: group.label, fields }` **only if non-empty**.
  4. Ungrouped tail: fields whose name is not in `claimed`, in original order,
     `filterAndSort`ed. Push `{ fields }` (no label) if non-empty.
- `getText` is the same field accessor used today: `f => [f.label, f.name]`.

### Rendering — `FilterInputFieldMenu.tsx`

- Compute `const sections = useMemo(() => buildFieldMenuSections(fields, fieldGroups, filterText), [...])`.
- Replace the single `filteredFields` `DropdownMenuGroup` block with a `.map`
  over `sections`:
  - When `section.label` is set: render `<DropdownMenuLabel>{section.label}</DropdownMenuLabel>`
    and a `<DropdownMenuSeparator/>` before subsequent sections (match
    Recent/Suggestions spacing).
  - `section.fields.map(...)` → existing `DropdownMenuItem` rows, **unchanged**
    (`value={`field-${field.name}`}`, `ref={registerItem(...)}`,
    `onSelect={() => onSelect(field)}`).
- **`flatItems` (keyboard nav source) must iterate sections in the same visual
  order** so Arrow navigation, Enter selection, and `registerItem` stay in sync.
  Because item ids are unchanged (field `name` is unique), only iteration order
  changes — the flat field loop becomes a section-then-field loop producing the
  same item objects in section order.
- **Empty state:** `MenuEmptyState` renders when `sections.length === 0` (search
  matched nothing) — replacing today's `filteredFields.length > 0 ? … : <MenuEmptyState/>`.
- `hasResults` (which gates the menu open) becomes `sections.length > 0 || !filterText`.

### Prop threading

`FilterInput` (`fieldGroups` prop) → `<FilterInputMenu fields fieldGroups autocomplete/>`
→ `<FilterInputFieldMenu fields fieldGroups …/>`. No context changes required;
`fieldGroups` is static config like `fields`.

## Units and boundaries

- `buildFieldMenuSections` — **what:** turns `(fields, fieldGroups, filterText)`
  into an ordered list of render-ready sections. **Depends on:** `filterAndSort`
  only. **Testable:** fully in isolation, no rendering.
- `FilterInputFieldMenu` — **what:** renders sections + Recent/Suggestions/AND-OR
  and wires keyboard nav. **Depends on:** `buildFieldMenuSections`, `DropdownMenu`
  primitives, `useKeyboardNav`.

## Testing

### Unit — `__tests__/buildFieldMenuSections.test.ts` (primary coverage)
- No `fieldGroups` → single passthrough section equal to `filterAndSort(fields)`.
- Group order preserved; field order within group preserved.
- Ungrouped fields appear in a trailing headerless section in original order.
- Empty group dropped when `filterText` matches none of its fields.
- Unknown field name in a group is skipped.
- Field listed in two groups appears once, in the first group.
- `startsWith` match floats to top **within** its group during search.

### Component — `__tests__/FilterInputFieldMenu.test.tsx`
- Group headers render with correct labels.
- Typing hides groups with no match; keeps matching group + its header.
- Keyboard nav (ArrowDown/Up) crosses group boundaries in visual order and
  Enter selects the highlighted field.
- No `fieldGroups` prop → identical DOM to current behavior (regression guard).

### E2E — extend `FilterInputFieldMenu.stories.tsx` + field-menu e2e
- Add a grouped fixture (reuse `stories/backendFieldsFixture.ts` field names).
- Screenshot: grouped browse state and a filtered state (empty groups gone).

## Scope guardrails (YAGNI)

Explicitly **not** in scope (can be layered on later if requested):
- Collapsible / accordion groups
- Per-group icons or counts
- Group-level "select all"
- Nested subgroups (single level of grouping only)

## Files touched

- `types.ts` — add `FieldGroup`; add `fieldGroups` to `FilterInputProps`.
- `lib/buildFieldMenuSections.ts` — new pure helper.
- `lib/index.ts` — export helper.
- `FilterInputMenu/FilterInputMenu.tsx` — accept + forward `fieldGroups`.
- `FilterInput.tsx` — accept `fieldGroups` prop, forward to `FilterInputMenu`.
- `FilterInputMenu/FilterInputFieldMenu/FilterInputFieldMenu.tsx` — render sections.
- `__tests__/buildFieldMenuSections.test.ts` — new.
- `__tests__/FilterInputFieldMenu.test.tsx` — extend.
- `stories/FilterInputFieldMenu.stories.tsx` — grouped story + fixture.
