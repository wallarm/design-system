# Two-value (paired) filter chip — design

**Date:** 2026-06-19
**Branch:** `feat/AS-1160-two-step-filter`
**Component:** `packages/design-system/src/components/FilterInput`

## Goal

Add a two-value ("paired" / two-step) filter chip to FilterInput. A single chip can
hold **two** attribute/operator/value triplets joined by a `;` separator, e.g.:

```
Context Param is xxx ; Value is yyy
```

The second triplet appears after the user fills the first value. Two-step mode is
opted into per field via field configuration.

## Decisions (from brainstorming)

| Question | Decision |
| --- | --- |
| Pairing model | **Field declares a paired second field.** The second attribute label and its operator/value options come from config; the user only fills the two values. |
| Operators | **Both operators selectable.** Each side runs the normal operator-selection step. The second *attribute* is fixed (not user-chosen). |
| Scope | **Full feature end-to-end** — data model, rendering, build cascade, inline editing, validation, serialization, stories, tests. |
| Second value | **Required.** A paired condition is valid only with both values filled. |
| Serialization | **Serialize as AND of two conditions** (`field1 op1 v1 AND field2 op2 v2`), **plus parser re-pairing** so copy/paste round-trips losslessly into one paired chip. |
| "Which side" modeling | **Approach A — a `side: 0 | 1` dimension** alongside the existing `editingSegment` enum (not new segment variants). |

## Architecture

The component is driven by an expression tree (`value` / `onChange` as `ExprNode`),
with `parseExpression` / `serializeExpression` string utilities also powering
copy/paste. A paired chip is a single `Condition` carrying a second triplet.

The whole build/edit state machine currently keys on
`editingSegment ∈ {attribute, operator, value}`. A paired chip has two triplets, so
a parallel **`side`** dimension (`0` = base triplet, `1` = paired triplet)
distinguishes them. `editingSegment` keeps its three-value shape; menu and commit
flows read/write `condition.value` or `condition.pair.value` based on `side`.

### 1. Data model (`types.ts`)

```ts
// FieldMetadata — opt a field into two-step mode.
interface FieldMetadata {
  …
  /**
   * When set, this field is a two-step paired field. The second segment is a
   * full field definition (label, type, operators, values, validate, …).
   * Nesting is one level only — a pairedField's own pairedField is ignored.
   */
  pairedField?: FieldMetadata;
}

// Condition — carries the second triplet.
interface Condition {
  …
  /** Second paired triplet. Present only for conditions whose field has pairedField. */
  pair?: {
    operator?: FilterOperator;
    value: string | number | boolean | null | Array<string | number | boolean>;
    error?: ChipErrorSegment;
    dateOrigin?: 'relative' | 'absolute';
  };
}

// FilterInputChipData — display side.
interface FilterInputChipData {
  …
  pair?: { attribute: string; operator?: string; value?: string; error?: ChipErrorSegment };
}
```

- The second **attribute** is `pairedField.label`, fixed and non-editable.
- The second **operator and value** are editable.

### 2. Rendering (`FilterInputChip.tsx`, `Segment.tsx`)

After the first triplet, when `pair` is present, render:

1. A **decorative `;` separator** — operator-styled text, non-interactive (no
   `role="button"`, no click/edit). The pasted example markup gave it
   `role="button"`/`aria-label="Edit filter operator"`; that is treated as a
   copy artifact and intentionally **not** reproduced.
2. `pair.attribute` — fixed label, non-clickable.
3. `pair.operator` — clickable (`side=1` operator).
4. `pair.value` — clickable (`side=1` value).

The `data-slot` values continue to use `segment-attribute` / `segment-operator` /
`segment-value` for the paired triplet (matching the example). The separator uses a
distinct non-interactive marker (e.g. `data-slot="segment-separator"`).

Chip CVA (`classes.ts`) is unchanged; the chip already grows with content and is
capped at `max-w-[320px]`.

### 3. Build cascade — "pick value 1, then side 2 appears"

Autocomplete gains a `buildingSide` state (`0` default). When side-0 value commits
for a field that has `pairedField`:

- Instead of `resetState`, set `buildingSide = 1`, swap `selectedField → pairedField`,
  clear `selectedOperator`, and re-enter the existing **operator → value** flow.
- The in-progress chip preview (`buildingChipData`) now shows the first triplet plus
  the paired attribute and the side-1 segments being built.
- When the side-1 value commits, write `condition.pair` and **then** `resetState`.

No new menu UI — the operator and value menus are reused for side 1.

`upsertCondition` gains a `side` argument (or a sibling `upsertPair`) so value/operator
commits target `condition.pair` when `side === 1`. The expression hook
(`useFilterInputExpression`) owns merging the paired triplet into the condition.

### 4. Inline editing

Clicking any of the **5 editable segments** (attr0, op0, val0, op1, val1) sets
`editingSegment` + `side` and reuses the existing field/operator/value flows:

- `side=0` writes the base triplet (unchanged behaviour).
- `side=1` writes `condition.pair`.

`useChipEditing.handleChipClick` resolves which side a clicked segment belongs to from
the chip layout, sets `side`, and seeds `selectedField` with the base field (side 0)
or `pairedField` (side 1). `EditingContext` carries `side` so `FilterInputChip` can
wire the correct segment's inline-edit props. Segment input refs are extended to
cover the side-1 operator/value inputs (e.g. a `side`-keyed lookup rather than three
fixed refs).

The fixed paired **attribute** is non-editable (clicking it is a no-op, like a
disabled segment).

### 5. Validation — second value required

`parseFilterInputErrors` / `FilterInputErrors`:

- A paired condition with a missing/empty `pair.value` (or `pair.operator`) is
  incomplete → `pair.error = 'value'` and the chip renders the paired value segment in
  the error style, surfaced as a validation message like existing value errors.
- `getFirstIncompleteSegment` is extended to walk side 1 after side 0, so resuming an
  incomplete paired chip lands on the first missing paired segment.

### 6. Serialization & parsing

- **`serializeExpression`** emits a paired condition as
  `field1 op1 v1 AND field2 op2 v2` (the paired triplet uses `pairedField.name` and
  its `serializeValue` transform).
- **`parseExpression` re-pairs:** when two adjacent AND-joined conditions satisfy
  `fieldA.pairedField?.name === conditionB.field`, they collapse back into one paired
  `Condition` (base = A, `pair` = B). This keeps copy/paste lossless.
- Re-pairing only applies to AND-adjacent pairs that match a configured `pairedField`;
  unrelated AND conditions are untouched.

### 7. Stories & tests

**Storybook** (`FilterInput.stories.tsx`, `FilterInputChip.stories.tsx`):
- A `pairedField`-configured field (`Context Param` → `Value`).
- Paired chip: default (both filled), building (side 1 in progress), error (missing
  second value), long text/truncation.

**Unit tests:**
- `buildChips`: condition with `pair` → two-triplet chip data + `;` separator.
- serialize → parse re-pair round-trip (one chip → AND string → one chip).
- validation: missing `pair.value` flagged.

**E2E** (`*.e2e.ts`, per `docs/e2e-test-rules.md`):
- Screenshot: rendered paired chip matches the design.
- Interaction: build flow (pick field → op0 → val0 → side 1 appears → op1 → val1 →
  commit); inline-edit a paired segment.
- Accessibility: paired chip segments expose correct roles/labels.

## Blast radius

~15–20 files: `types.ts`, `FilterInputChip.tsx`, `Segment.tsx`, `segmentVariant.ts`
(separator), `buildChips.ts`, `useFilterInputExpression` (+ `upsertCondition`
signature), `useChipEditing.ts`, the `useMenuFlow` hooks (`useFieldFlow`,
`useOperatorFlow`, `useValueFlow`), `useChipCascade.ts`, `useSegmentEditFlow.ts`,
`EditingContext.tsx`, autocomplete state (segment refs, `buildingSide`),
`parseExpression` / `serializeExpression`, `parseFilterInputErrors`, stories, tests.

## Phasing (for the implementation plan)

1. **Data model + rendering** — types, `buildChips`, `FilterInputChip`/`Segment`,
   a static Storybook story driven by a `pair`-bearing condition.
2. **Build cascade** — `buildingSide`, `upsertCondition` side arg, value-flow side-1
   advance.
3. **Inline editing** — side-aware `useChipEditing`, `EditingContext`, segment refs,
   cascade.
4. **Validation** — incomplete-paired detection + error surfacing.
5. **Serialize / parse re-pair** — `serializeExpression`, `parseExpression`.
6. **Tests** — unit + E2E + finalize stories.

## Out of scope / non-goals

- More than two triplets per chip (only one paired level).
- User-chosen second attribute (it is fixed by `pairedField`).
- Per-side independent freeform fields (the pairing is field-driven).
