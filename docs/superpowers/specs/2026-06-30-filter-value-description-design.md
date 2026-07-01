# FilterInput value-option description line

**Date:** 2026-06-30
**Component:** `FilterInput` → `FilterInputValueMenu`
**Related story:** `Patterns/FilterInput/FilterInput → PairedField*`

## Problem

A field's value-options dropdown (`FilterInputValueMenu`) renders each option as a
single bold line (`label`). Consumers need to attach a secondary line of
descriptive text beneath the bold label — e.g. a backend path
(`requests->headers->request-id`) that explains or disambiguates the option.

Crucially, the bold label is **not unique**: two or more rows may share the same
bold `label` (e.g. two `request-id` rows), and the secondary text is what
visually distinguishes them.

## Design

### 1. Type: extend the public option API

Add an optional `description?: string` to:

- `FieldValueOption` (`types.ts`) — the public field-config surface.
- `ValueOption` (`FilterInputValueMenu.tsx`) — the menu's option type.

`FieldValueOption[]` is assigned directly into the menu's `ValueOption[]`
(`FilterInputMenu.tsx` `menuValues`), and the cross-field relabel spread
(`{ ...result[i]!, value, label }`) preserves extra keys, so `description`
threads through end-to-end with no additional plumbing.

### 2. Rendering (`ValueMenuItem.tsx`)

In the non-badge branch, when `option.description` is present, render a second
line beneath the bold label:

- Primary: existing `<Text size="sm" truncate>{label}</Text>` (bold line).
- Secondary: `<Text size="xs" truncate className="text-text-secondary">{description}</Text>`.

Both lines live inside the existing `min-w-0` column container so truncation
works. Badge options remain single-line (no description rendered).

### 3. Duplicate bold labels

No special handling needed. The React `key` and multi/single-select matching are
keyed on `String(option.value)` (unique), not `label`. Rows with identical
`label` but distinct `value` render and toggle independently; the `description`
distinguishes them visually.

### 4. Filtering

Extend the `filterAndSort` accessor in `FilterInputValueMenu` from
`v => [v.label, String(v.value)]` to
`v => [v.label, String(v.value), v.description ?? '']`, so typing a path
fragment matches the row.

### 5. Demo (Paired story)

Give the paired `context_param` field a `values` array carrying `description`
paths, including a duplicate-label pair (two `request-id` rows with distinct
values/paths) to demonstrate the disambiguation case.

### 6. Tests (TDD)

- Component test: description line renders when `description` is set; absent when
  not.
- Component test: two options with identical `label` but distinct `value` both
  render and toggle independently.

## Scope / Non-goals

- Touches only `FieldValueOption`/`ValueOption` types, `ValueMenuItem`,
  `FilterInputValueMenu` (filter accessor), and the Paired story.
- No changes to operator/field menus, chip rendering, the parser, or
  serialization. `description` is display-only — it is never committed as a
  filter value.
